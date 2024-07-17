import { put, del } from "@vercel/blob";

export async function uploadFile(request, response) {
  try {
    const blob = await put(request.query.filename, request, {
      access: "public",
    });
    return response.status(200).json(blob);
  } catch (error) {
    console.error("Error creating blob", error);
    response.status(500).json({ message: "Internal server error" });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
  runtime: "edge",
};

export async function deleteFile(request, response) {
  try {
    await del(request.body.url);
    return response.status(200).json({ message: "Successfully deleted file" });
  } catch (error) {
    console.error("Error deleting blob", error);
    response.status(500).json({ message: "Internal server error" });
  }
}
