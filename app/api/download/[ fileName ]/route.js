import fs from "fs";
import path from "path";

export async function GET(request, { params }) {
  const { fileName } = params;
  const filePath = path.join(process.cwd(), "public/uploads", fileName);

  if (!fs.existsSync(filePath)) {
    return new Response("File not found", { status: 404 });
  }

  const fileStream = fs.createReadStream(filePath);
  return new Response(fileStream, {
    headers: {
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Type": "application/octet-stream"
    }
  });
}
