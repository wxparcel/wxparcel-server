
export default app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const projectSchema = new Schema({
    name: { type: String },
    desc: { type: String },
    repoUrl: { type: String },
    createTime: { type: Date },
    order: [{
      uid: String,
      repoUrl: String,
      gitMessage: String,
      gitDatetime: Date,
      appid: String,
      version: String,
      message: String,
      compileType: String,
      libVersion: String,
      projectname: String,
      gitUser: String,
      pkgSize: Number,
      gitEmail: String,
      createTime: Date,
      filePath: '',
    }],
    // order: Object,
    isLogin: Boolean,
  });

  return mongoose.model('project', projectSchema);
};
