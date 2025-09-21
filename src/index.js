import connectDB from './db/index.js'
import express from 'express';
import { app } from './app.js';

// import dotenv from 'dotenv'
// require('dotenv').config({path:'./env'})



import dotenv from 'dotenv';
dotenv.config({ path: './env' });

console.log("The running port is :",process.env.PORT)
connectDB()



