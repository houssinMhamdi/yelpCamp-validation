const mongoose = require('mongoose')
const campGroundSchema  = mongoose.Schema({
    title:String,
    image:String,
    price:Number,
    description:String,
    location:String
})

module.exports = mongoose.model('campground',campGroundSchema)