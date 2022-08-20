import mongoose from 'mongoose';
const modelName = 'Item';
const { Schema } = mongoose;

let schema = new Schema({
  id:  {type: [String], index: true},
  name: String,
  manufactureCountry: String,
  unitOfMeasure: Number,
  shufersal: [
    {
      storeId: Number,
      price: Number,
      unitofmeasureprice: Number,
    }
  ]
});

item.methods.findItemById = function (itemId) {
  return mongoose.model(modelName).find({ id: itemId});
}

const item = db.model('Item', schema);
module.exports = item;