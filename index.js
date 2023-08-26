const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const sendGridMail = require('@sendgrid/mail');
const users = require('./Models/Users');
const posts = require('./Models/Posts');


const app = express();
app.use(express.json());
app.use(helmet());
app.use(cors());
dotenv.config();


app.listen(process.env.PORT, ()=>{
    console.log('Connected to Server');
    mongoose.connect(process.env.MONGO, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    mongoose.connection.on('error', (error) => {
        console.error('Disconnected from MongoDB');
    });
    mongoose.connection.once('open', () => {
        console.log('Connected to MongoDb');
    })

});











sendGridMail.setApiKey(process.env.SENDGRID_API_KEY);

function sendMessage(body, email) {
    return {
    to: email,
    from: 'elbasria31@gmail.com',
    subject: 'OTP Verification',
    text: body,
    html: `<strong>${body}</strong>`,
    };
}

app.post('/register', async(req, res)=>{
    try{

        const { email, fullName, password } = req.body;
        const isFound = await users.findOne({email});
        if(isFound){
            res.status(202).send('Email Already Taken');
        }
        else{
            //not found ==> create a new account
            const isCreated = await users.create({
                email, 
                fullName, 
                password
            });
            if(isCreated){
                res.status(200).send("Successfully Created an account");
            }
            else{
                res.status(201).send('Error creating a new account');
            }
        }

    }
    catch(e){
        console.log(e.message);
        res.status(500).send(e.message);
    }
});


app.post('/login', async(req, res)=>{
    try{
        const { email, password } = req.body;
        const isFound = await users.findOne({email});
        if(isFound){
            if(isFound.password === password){
                res.status(200).send(isFound._id);
            }
            else{
                res.status(202).send('Bad Credentials');
            }   
        }
        else{
            res.status(202).send('Not found');
        }
    }
    catch(e){
        console.log(e.message);
        res.status(500).send(e.message);
    }
});

function generateOTP() {
    let otp = '';
    for (let i = 0; i < 6; i++) {
      otp += Math.floor(Math.random() * 10);
    }
    return otp;
  }

app.post('/forgot', async(req, res)=>{
    try{
        const { email } = req.body;
        const isFound = await users.findOne({email});
        if(isFound){
            const OTPNew = generateOTP();
            const isUpdated = await users.findByIdAndUpdate(isFound._id, {
                OTP : OTPNew
            });
            if(isUpdated){
                
                await sendGridMail.send(sendMessage(`OTP : ${OTPNew}`, isFound.email));
                res.status(200).send('GOOd SENT OTP');
            }
            else{
                res.status(202).send("ERROR");
            }
        }
        else{
            res.status(202).send('Not found');
        }
    }
    catch(e){
        console.log(e.message);
        res.status(500).send(e.message);
    }
});



app.post('/verifyOTP', async(req, res)=>{
    try{
        const { OTP, email } = req.body;
        const isFound = await users.findOne({email});
        if(isFound){
           
            if(isFound.OTP === OTP){
                
                
                const isUpdated = await users.findByIdAndUpdate(isFound._id, {
                    OTP : ""
                })

                if(isUpdated){
                    res.status(200).send('Good OTP');
                }
                else{
                    res.status(222).send('ERROR UPdating Documents');
                }
                
            }
            else{
                res.status(404).send('Not identical OTP');
            }

        }
        else{
            res.status(202).send('Not found');
        }
    }
    catch(e){
        console.log(e.message);
        res.status(500).send(e.message);
    }
});



app.post('/resetPassword', async(req, res)=>{
    try{
        const { password, email } = req.body;
        const isFound = await users.findOne({email});

        if(isFound){                        
            const isUpdated = await users.findByIdAndUpdate(isFound._id, {
                password : password
            })
            if(isUpdated){
                res.status(200).send('Password Changed');
            }
            else{
                  res.status(222).send('ERROR UPdating Documents');
            }
        }
        else{
            res.status(202).send('Not found');
        }
    }
    catch(e){
        console.log(e.message);
        res.status(500).send(e.message);
    }
});



app.post('/create', async(req, res)=>{
    try{
        const { title, content, userId, image } = req.body;
        const isCreated = await posts.create({
            title, 
            content, 
            image,
            userId
        });
        if(isCreated){                        
             res.status(200).send('Created');
        }
        else{
            res.status(202).send('Not found');
        }
    }
    catch(e){
        console.log(e.message);
        res.status(500).send(e.message);
    }
});



app.get('/getAllPosts', async(req, res)=>{
    try{
        
        const isFetched = await posts.find().sort({
            createdAt : -1
        });

        if(isFetched){
            res.status(200).send(isFetched);
        }
        else{
            res.status(202).send('Error Fetchign...');
        }
        
    }
    catch(e){
        console.log(e.message);
        res.status(500).send(e.message);
    }
});


app.get('/getAllPosts/:idUser', async(req, res)=>{
    try{
        const {idUser }=  req.params;
        const isFetched = await posts.find({
            userId : idUser
        }).sort({
            createdAt : -1
        })

        if(isFetched){
            res.status(200).send(isFetched);
        }
        else{
            res.status(202).send('Error Fetchign...');
        }
        
    }
    catch(e){
        console.log(e.message);
        res.status(500).send(e.message);
    }
});





app.get('/getInfos/:id', async(req, res)=>{
    try{

        const {id} = req.params;
        const isFetched = await posts.findOne({
            _id : id
        });

        if(isFetched){
            res.status(200).send(isFetched);
        }
        else{
            res.status(202).send('Error Fetchign...');
        }
        
    }
    catch(e){
        console.log(e.message);
        res.status(500).send(e.message);
    }
});
