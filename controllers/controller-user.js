const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../models");
const random = require("randomstring");
require("dotenv").config();
const User = db.user;

const Op= db.Sequelize.Op;

module.exports = {
    saveUser(req,res){
        User.findOne({ where: { email: req.body.email } })
        .then((dataUser) => {
            if (dataUser==null) {
                let data = {
                    idUser: random.generate(),
                    email: req.body.email,
                    name: req.body.name,
                    password: bcrypt.hashSync(req.body.password, 10),
                    status: true,
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




    },

    updateUser(req,res){
        let data = {
            email: req.body.email,
            name: req.body.name,
            status: req.body.status,
            role: req.body.role,
            deptCode: req.body.deptCode,
        };
        User.update(data,{where : {idUser:req.params.idUser}})
        .then((dataRes) => {
            return res.status(200).send({
                success: true,
                message : "User Update successfuly"
            });
        })
        .catch((err) => {
            res.status(500).send({
                message: "Something is wrong" + err.message,
                success: false
            });
        });
    },
    updateUserPassword(req,res){
        let datainput = {
            name: req.body.name,
            password:bcrypt.hashSync(req.body.password, 10)
        };

        User.findOne({where : {idUser : req.params.idUser}}).then((data)=>{

            let validPassword = bcrypt.compareSync(req.body.oldPassword, data.password);
            if(validPassword){
                User.update(datainput,{where : {idUser : req.params.idUser}}).then((dataUpdate)=>{
                    if(dataUpdate){
                        return res.status(200).send({
                            success: true,
                            message : "Profile dan password update"
                        });
                    }else{
                        return res.status(400).send({
                            success: false,
                            message : "failed"
                        });
                    }
                }).catch(err=>{
                    console.log(err);
                })
            }else{
                return res.status(400).send({
                    success: false,
                    message : "Password lama salah"
                });
            }
        });
    },
    getUser(req,res){
        let cari = req.query['cari'] || '';
        User.findAll(
            {
                where:{
                    name: { [Op.iLike]: `%${cari}%`},
                },
            }
        )
        .then((data) => {
            if (data === null) {
                return res.status(400).send({
                    success: false,
                    message: "No data !"
                });
            } else {
                // res.send(data);
                return res.status(200).send({
                    success: true,
                    message: "Success",
                    data : data
                });
            }
        })
        .catch((err) => {
            res.status(500).send({
                message: "Something is wrong" + err.message,
                success: false
            });
        });
    },
    getUserById(req,res){
        User.findOne(
            {
                where:{
                    idUser: req.params.idUser,
                },
            }
        )
        .then((data) => {
            if (data === null) {
                return res.status(400).send({
                    success: false,
                    message: "No data !"
                });
            } else {
                // res.send(data);
                return res.status(200).send({
                    success: true,
                    message: "Success",
                    data : data
                });
            }
        })
        .catch((err) => {
            res.status(500).send({
                message: "Something is wrong" + err.message,
                success: false
            });
        });
    },
    deleteUser(req,res){
        User.destroy({ where : {idUser: req.params.idUser}})
        .then( () => {
            return res.status(200).send({
                success: true,
                message: "Success Delete User"
            });
        })
        .catch( (err) => {
            res.status(500).send({
                message: "Something is wrong" + err.message,
                success: false
            });
        });
    }

      
}