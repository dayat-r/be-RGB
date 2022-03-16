const db = require("../models");
const random = require("randomstring");
require("dotenv").config();
const Customer = db.customer;
const Op= db.Sequelize.Op

module.exports = {
    saveCustomer(req,res){
        let data = {
            idCustomer: random.generate(),
            name: req.body.name,
            address: req.body.address,
            telp: req.body.telp,
            deptCode: req.body.deptCode,
        };
       
        
        Customer.create(data)
        .then((dataRes) => {
            return res.status(200).send({
                success: true,
                message : "Customer save successfuly",
                data : dataRes
            });
        })
        .catch((err) => {
            res.status(500).send({
                message: "Something is wrong" + err.message,
                success: false
            });
        });
    },
    updateCustomer(req,res){
        let data = {
            name: req.body.name,
            address: req.body.address,
            telp: req.body.telp,
            deptCode: req.body.deptCode,
            piutang: req.body.piutang,
        };
        Customer.update(data,{where : {idCustomer:req.params.idCustomer}})
        .then((dataRes) => {
            return res.status(200).send({
                success: true,
                message : "Customer save successfuly"
            });
        })
        .catch((err) => {
            res.status(500).send({
                message: "Something is wrong" + err.message,
                success: false
            });
        });
    },
    getCustomer(req,res){
        let cari = req.query['cari'] || '';
        Customer.findAll(
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
    getCustomerById(req,res){
        Customer.findOne(
            {
                where:{
                    idCustomer: req.params.idCustomer,
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
    deleteCustomer(req,res){
        Customer.destroy({ where : {idCustomer: req.params.idCustomer}})
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