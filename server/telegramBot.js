const { Telegraf } = require("telegraf");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const UPLOAD_DIR = path.join(process.cwd(), "public/uploads");

// Ensure the upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Initialize the Telegram bot
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.on("message", async (ctx) => {
  if (ctx.message.document || ctx.message.video) {
    const fileId = ctx.message.document?.file_id || ctx.message.video?.file_id;
    const fileName = ctx.message.document?.file_name || `${Date.now()}.mp4`;

    try {
      const fileLink = await ctx.telegram.getFileLink(fileId);
      const filePath = path.join(UPLOAD_DIR, fileName);

      console.log(`Downloading file to: ${filePath}`);

      const response = await fetch(fileLink.href);
      const fileStream = fs.createWriteStream(filePath);
      response.body.pipe(fileStream);

      fileStream.on("finish", () => {
        if (fs.existsSync(filePath)) {
          const frontendUrl = `${process.env.BASE_URL}/api/stream/${fileName}`;

          console.log(`Frontend URL: ${frontendUrl}`);

          ctx.reply(
            `🎥 **Your Movie Links**:\n\n🔗 [Stream & Download Here](${frontendUrl})`,
            { parse_mode: "Markdown" }
          );
        } else {
          ctx.reply("❌ Failed to save the file. Please try again.");
        }
      });
    } catch (error) {
      console.error("Error processing the file:", error);
      ctx.reply("❌ Error processing the file. Please try again.");
    }
  } else {
    ctx.reply("❌ Please forward a valid movie file.");
  }
});

// Start the bot
bot.launch();
console.log("Telegram bot is running...");
