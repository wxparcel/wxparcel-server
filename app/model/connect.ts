
export default app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const connectSchema = new Schema({
    clientId: [ String ],
    deployId: { type: String },
    projectId: { type: String },
    isLogin: { type: Boolean },
  });

  return mongoose.model('connect', connectSchema);
};
