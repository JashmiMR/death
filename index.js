const express = require('express')
const mongoose = require('mongoose')

const app = express()

mongoose.connect('mongodb://localhost:27017/death_certificate')

const UserSchema = mongoose.Schema({
    date_of_death: Date,
    gender: String,
    deceased_name: String,
    care_of: String,
    father_husband_name: String,
    deceased_age_years: String,
    deceased_age_months: String,
    deceased_age_days: String,
    deceased_age_hours: String,
    address: {
      line: String,
      country: String,
      state: String,
      district: String,
      pin: String,
    },
    contact: {
      mobile_no: String,
      email: String,
    },
    place_of_death: String,
    death_address: {
      line: String,
      country: String,
      state: String,
      district: String,
      pin: String,
    },
    uploaded_files: {
      aadhaar_card: String,
      birth_certificate: String,
      medical_certificate: String,
    },
    informant: {
      name: String,
      sex: String,
      relation_with_deceased: String,
      identity_proof: String,
    },
    otp: String,
  })

  const UserModel = mongoose.model("users, UserSchema")
  

app.get("/getUsers", (req, res) =>{
   UserModel.find({}).then(function(users){
    res.json(users)
   }).catch(function(err){
    
   })

})

app.listen(3001, () => {
    console.console.log("Server is running")
    
})