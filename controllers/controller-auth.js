const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../models");
const random = require("randomstring");
require("dotenv").config();
const User = db.user;


const {
    JWTSECRET,
} = process.env;


module.exports = {
    login(req,res){
        if (!req.body.email || !req.body.password) {
            res.status(400).send({
                success: false,
                message: "Data not valid !"
            });
            return;
        }
        User.findOne({ where: { email: req.body.email } })
        .then((data) => {
            if (data === null) {
                return res.status(401).send({
                    success: false,
                    message: "User not found !"
                });
            } else {


                let validPassword = bcrypt.compareSync(req.body.password, data.password);
                if (!validPassword) {
                    return res.status(400).send({
                        success: false,
                        message: "Password dont match"
                    });
                } else {
                    let token = jwt.sign({
                        user: data.idUser,
                        name : data.name,
                        role : data.role
                    }, JWTSECRET,
                    {
                        expiresIn: '1d'
                    });
                    return res.status(200).send({
                        success: true,
                        token: "Bearer"+ " "+token
                    });
                }
            }
        })
        .catch((err) => {
            res.status(500).send({
                message: "Something is wrong" + err.message,
                success: false
            });
        });
    },
    saveRegister(req,res){
        if (!req.body.email) {
            res.status(400).send({
                message: "Email tidak boleh kosong !",
                success: false
            });
            return;
        }
        else{
            User.findOne({ where: { email: req.body.email } })
            .then((dataUser) => {
                res.send(dataUser)
                if (dataUser==null) {
                    let data = {
                        idUser: random.generate(),
                        email: req.body.email,
                        name: req.body.name,
                        password: bcrypt.hashSync(req.body.password, 10),
                        status: req.body.status,
                        role: req.body.role,
                        deptCode: req.body.deptCode,
                    };
                    User.create(data)
                    .then((dataRes) => {
                        // res.send(data);
                        return res.status(200).send({
                            success: true,
                        });
                    })
                    .catch((err) => {
                        res.status(500).send({
                            message: "Something is wrong" + err.message,
                            success: false
                        });
                    });
                }
                else{
                    res.status(402).send({
                        message: "Email Already exist" ,
                        success: false
                    });
                }
            })
        }
        



    },

      
}