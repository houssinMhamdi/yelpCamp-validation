const express = require('express')
const app = express()
const path = require('path')
const ejsMate = require('ejs-mate')
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')
const Campground = require('./models/campground')
const methodOverride = require('method-override')
const {campgroundSchema} = require('./schemas.js')
const mongoose = require('mongoose')


const DB_URL = 'mongodb://localhost:27017/yelp-camp'
mongoose.connect(DB_URL)

app.use(express.urlencoded({extends:true}))
app.use(methodOverride('_method'))
app.engine('ejs',ejsMate)
app.set('view engine','ejs')
app.set('views','views')

const validateCampground = (req,res,next)=>{
    const result = campgroundSchema.validate(req.body)
    console.log(result);
    const {error} = campgroundSchema.validate(req.body)
    if(error){
        const msg = error.details.map(el=>el.message).join(',')
        throw new ExpressError(msg,400)
    }else{
        next()
    }
}

app.get('/',(req,res,next)=>{
    res.render('home')
})

app.get('/campgrounds',async(req,res,next)=>{
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index',{campgrounds})

})

app.get('/campgrounds/new',(req,res,next)=>{
    res.render('campgrounds/new')
})

app.post('/campgrounds',validateCampground,catchAsync(async(req,res,next)=>{
    
    const campground = new Campground(req.body.campground)
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.get('/campgrounds/:id',catchAsync(async(req,res,next)=>{
    const {id} = req.params
    const campgrounds = await Campground.findById(id)
    res.render('campgrounds/show',{campgrounds})
}))

app.get('/campgrounds/:id/edit',catchAsync(async(req,res,next)=>{
    const {id} = req.params
    const campground = await Campground.findById(id)
    res.render('campgrounds/edit',{campground})
}))

app.put('/campgrounds/:id',validateCampground,catchAsync(async(req,res,next)=>{
    const {id} = req.params
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground})
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.delete('/campgrounds/:id',catchAsync(async(req,res,next)=>{
    const {id} = req.params
    const campground = await Campground.findByIdAndDelete(id)
    res.redirect(`/campgrounds`)
}))
app.all('*',(req,res,next)=>{
    next(new ExpressError('Page Not Found',404))
})
app.use((err,req,res,next)=>{
    const {statusCode=500} = err
    if(!err.message) err.message = 'oh no there is an error'  
    res.status(statusCode).render('error',{err})
})

const PORT = 3000
app.listen(PORT,()=>{
    console.log(`servert run port ${PORT}`);
})