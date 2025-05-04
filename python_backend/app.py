import os
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE" 

import os
from flask import Flask, request, jsonify
import pandas as pd
import joblib
from DeepImageSearch import Load_Data, Search_Setup

app = Flask(__name__)

# Load the model and data for video recommendations
cvv = joblib.load('count_vectorizer.pkl')
similarityv = joblib.load('similarity_matrix.pkl')
new_videos_data = pd.read_csv('videos.csv')

# Image search setup
folder_path = 'Images'  
upload_folder = 'uploads' 
os.makedirs(upload_folder, exist_ok=True)

def load_images_from_folder(folder_path):
    image_list = []
    for filename in os.listdir(folder_path):
        if filename.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp')):
            full_path = os.path.join(folder_path, filename)
            image_list.append((full_path, filename))
    return image_list

# Initialize data loader and search setup
dl = Load_Data()
dl.from_folder([folder_path])
image_list = load_images_from_folder(folder_path)

st = Search_Setup([img[0] for img in image_list], model_name="vgg19", pretrained=True)
st.get_image_metadata_file()  # Load existing metadata

# Function to find similar images
def find_similar_images(image_path, num_images):
    similar_images = st.get_similar_images(image_path=image_path, number_of_images=num_images)
    return similar_images

# Video recommendation function
def recommand_videos(keyword):
    keyword_parts = keyword.lower().split()
    filtered_videos = new_videos_data[new_videos_data['title'].str.contains('|'.join(keyword_parts), case=False, na=False)]
    
    if filtered_videos.empty:
        return None

    total_similarity = [0] * len(new_videos_data)
    for index in filtered_videos.index:
        for i in range(len(total_similarity)):
            total_similarity[i] += similarityv[index][i]

    distance = sorted(enumerate(total_similarity), key=lambda x: x[1], reverse=True)
    recommendations = []

    for i in distance:
        recommended_video = new_videos_data.iloc[i[0]]
        if recommended_video.title not in filtered_videos['title'].values:
            recommendations.append(int(recommended_video['id']))

    return recommendations

@app.route('/recommend', methods=['GET'])
def recommend():
    keyword = request.args.get('keyword')
    
    recommendations = recommand_videos(keyword)
    
    if recommendations is None:
        return jsonify({'message': f"No videos found containing the keyword(s): '{keyword}'."}), 404

    filtered_videos = new_videos_data[new_videos_data['title'].str.contains('|'.join(keyword.lower().split()), case=False, na=False)]
    
    response = {
        'filtered_video_ids': [int(row['id']) for _, row in filtered_videos.iterrows()],
        'recommendation_ids': recommendations
    }

    return jsonify(response)

@app.route('/recommendusingimage', methods=['POST'])
def recommend_using_image():
    if 'file' not in request.files:
        return jsonify({'message': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'message': 'No selected file'}), 400

    file_path = os.path.join(upload_folder, file.filename)
    file.save(file_path)

    similar_indices = find_similar_images(image_path=file_path, num_images=15)
    similar_images = [image_list[index][1] for index in similar_indices]  # Only get the image names

   
    response = {
        'similar_images': similar_images
    }
    
    return jsonify(response)

if __name__ == '__main__':
    print("Starting Flask application...")
    app.run(port=5000, debug=True)
