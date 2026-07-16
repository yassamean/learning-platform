import React, { useState } from "react";

const VideoUpload = () => {
  const [video, setVideo] = useState(null);

  const handleVideoChange = (e) => {
    setVideo(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    if (video) {
      formData.append("video", video);
    }

    try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/upload/video`, {
      method: "POST",
    body: formData,
  });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("File upload successful:", data);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="video">Video:</label>
        <input
          type="file"
          id="video"
          accept="video/*"
          onChange={handleVideoChange}
        />
      </div>
      <button type="submit">Upload Video</button>
    </form>
  );
};

export default VideoUpload;
