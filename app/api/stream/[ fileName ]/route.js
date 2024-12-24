import fs from "fs";
import path from "path";

export async function GET(request) {
  const url = new URL(request.url);
  const fileName = url.pathname.split("/").pop(); // Extract last segment of the path

  if (!fileName) {
    console.error("FileName parameter is missing");
    return new Response("File name is required", { status: 400 });
  }

  const filePath = path.join(process.cwd(), "public/uploads", fileName);

  if (!fs.existsSync(filePath)) {
    console.error("File not found:", filePath);
    return new Response("File not found", { status: 404 });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = request.headers.get("range");

  if (range) {
    const [start, end] = range.replace(/bytes=/, "").split("-");
    const startByte = parseInt(start, 10);
    const endByte = end ? parseInt(end, 10) : fileSize - 1;

    const chunkSize = endByte - startByte + 1;
    const file = fs.createReadStream(filePath, {
      start: startByte,
      end: endByte
    });

    console.log(`Streaming bytes ${startByte}-${endByte} of ${fileSize}`);

    return new Response(file, {
      headers: {
        "Content-Range": `bytes ${startByte}-${endByte}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": "video/mp4"
      },
      status: 206
    });
  }

  console.log(`Serving full file: ${fileSize} bytes`);

  const file = fs.createReadStream(filePath);
  return new Response(file, {
    headers: {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4"
    }
  });
}
