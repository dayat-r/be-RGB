const db = require("../models");
const random = require("randomstring");
require("dotenv").config();
const Merk = db.merk;
const Op= db.Sequelize.Op;
const fs = require('fs')

module.exports = {
    saveMerk(req,res){
        let data = {
            kodeMerk: req.body.kodeMerk,
            name: req.body.name,
            path: req.body.path,
            status: true,
        };
        Merk.create(data)
        .then(() => {
            return res.status(200).send({
                success: true,
                message : "Merk save successfuly"
            });
        })
        .catch((err) => {
            res.status(500).send({
                message: "Something is wrong" + err.message,
                success: false
            });
        });
    },
    updateMerk(req,res){
        let data = {
            kodeMerk: req.body.kodeMerk,
            name: req.body.name,
            path: req.body.path,
            status: req.body.status,
        };
        Merk.update(data,{where : {kodeMerk:req.params.kodeMerk}})
        .then(() => {
            return res.status(200).send({
                success: true,
                message : "Merk save successfuly"
            });
        })
        .catch((err) => {
            res.status(500).send({
                message: "Something is wrong" + err.message,
                success: false
            });
        });
    },
    getMerk(req,res){
        let cari = req.query['cari'] || '';
        Merk.findAll(
            {
                where:{
                    name: { [Op.iLike]: `%${cari}%`},
                },
                order: [
                    ['createdAt', 'DESC'],
                ],
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
    getMerkById(req,res){
        Merk.findOne(
            {
                where:{
                    kodeMerk: req.params.kodeMerk,
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
    deleteMerk(req,res){
        Merk.destroy({ where : {kodeMerk: req.params.kodeMerk}})
        .then( () => {
            try {
                fs.unlinkSync(`uploads/merk/${req.params.kodeMerk}.jpg`);
        
        
            } catch (e) {
                // res.status(400).send({ message: "Error deleting image!", error: e.toString(), req: req.body });
            }
            return res.status(200).send({
                success: true,
                message: "Success Delete Merk"
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