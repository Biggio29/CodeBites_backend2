const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
    imgSrc: {
        type: String,
        required: true,
    },
    title:{
        type: String,
        required: true,
    },
    description:{
        type: String,
        required: true,
    },
    ingredients:{
        type: String,
        required: true,
    },
    instructions:{
        type: String,
        required: true,
    },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });
const Recipe = mongoose.model("Recipe", recipeSchema);
module.exports = Recipe;