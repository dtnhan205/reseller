const mongoose = require("mongoose");

async function checkMongoConfig() {
  try {
    console.log("🔄 Đang kết nối MongoDB Atlas...\n");

    const uri = `mongodb://nhandtps40210:dtn280705reseller@ac-0evdfk1-shard-00-00.bk91ctf.mongodb.net:27017/Reseller?ssl=true&authSource=admin&directConnection=true`;

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 20000,
    });

    console.log("✅ Đã kết nối MongoDB\n");

    // Kiểm tra replSet status
    const adminDb = mongoose.connection.db.admin();
    
    try {
      const result = await adminDb.command({ replSetGetStatus: 1 });
      console.log("✅ MongoDB có REPLICA SET:");
      console.log(`   Replica Set Name: ${result.set}`);
      console.log(`   Members: ${result.members?.length || 0}`);
    } catch (e) {
      console.log("❌ MongoDB KHÔNG có REPLICA SET!");
      console.log("   → Vì vậy `withTransaction()` KHÔNG hoạt động!");
      console.log("   → Đây là NGUYÊN NHÂN của bug!");
    }

    mongoose.disconnect();

  } catch (error) {
    console.error("❌ Lỗi:", error.message);
  }
}

checkMongoConfig();
