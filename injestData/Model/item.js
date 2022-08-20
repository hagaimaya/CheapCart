import mongoose from 'mongoose';
const modelName = 'Item';
const { Schema } = mongoose;

const item = new Schema({
  id:  {type: [String], index: true},
  name: String,
  body:   String,
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