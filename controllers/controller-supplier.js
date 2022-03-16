const db = require("../models");
const random = require("randomstring");
require("dotenv").config();
const Supplier = db.supplier;
const Op= db.Sequelize.Op

module.exports = {
    saveSupplier(req,res){
        let data = {
            idSupplier: random.generate(),
            name: req.body.name,
            address: req.body.address,
            telp: req.body.telp,
            hutang : 0
        };
        Supplier.create(data)
        .then((dataRes) => {
            return res.status(200).send({
                success: true,
                data : dataRes.dataValues,
                message : "Supplier save successfuly"
            });
        })
        .catch((err) => {
            res.status(500).send({
                message: "Something is wrong" + err.message,
                success: false
            });
        });
    },
    updateSupplier(req,res){
        let data = {
            name: req.body.name,
            address: req.body.address,
            telp: req.body.telp,
            hutang : req.body.hutang
        };
        Supplier.update(data,{where : {idSupplier:req.params.idSupplier}})
        .then((dataRes) => {
            return res.status(200).send({
                success: true,
                message : "Supplier save successfuly"
            });
        })
        .catch((err) => {
            res.status(500).send({
                message: "Something is wrong" + err.message,
                success: false
            });
        });
    },
    getSupplier(req,res){
        let cari = req.query['cari'] || '';
        Supplier.findAll(
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
    getSupplierById(req,res){
        Supplier.findOne(
            {
                where:{
                    idSupplier: req.params.idSupplier,
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
    deleteSupplier(req,res){
        Supplier.destroy({ where : {idSupplier: req.params.idSupplier}})
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