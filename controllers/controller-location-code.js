const db = require("../models");
const random = require("randomstring");
require("dotenv").config();
const LocCode = db.locationCode;
const Op= db.Sequelize.Op

module.exports = {
    saveLocation(req,res){
        let data = {
            locCode: req.body.locCode,
            name: req.body.name,
            address: req.body.address,
            telp: req.body.telp,
            deptCode: req.body.deptCode,
        };
       
        
        LocCode.create(data)
        .then((dataRes) => {
            return res.status(200).send({
                success: true,
                message : "location save successfuly"
            });
        })
        .catch((err) => {
            res.status(500).send({
                message: "Something is wrong" + err.message,
                success: false
            });
        });
    },
    updateLocation(req,res){
        let data = {
            locCode: req.body.locCode,
            name: req.body.name,
            address: req.body.address,
            telp: req.body.telp,
            deptCode: req.body.deptCode,
        };
        LocCode.update(data,{where : {locCode:req.params.locCode}})
        .then((dataRes) => {
            return res.status(200).send({
                success: true,
                message : "Location save successfuly"
            });
        })
        .catch((err) => {
            res.status(500).send({
                message: "Something is wrong" + err.message,
                success: false
            });
        });
    },
    getLocation(req,res){
        let cari = req.query['cari'] || '';
        LocCode.findAll(
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
    getLocationById(req,res){
        LocCode.findOne(
            {
                where:{
                    locCode: req.params.locCode,
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
    deleteLocation(req,res){
        LocCode.destroy({ where : {locCode: req.params.locCode}})
        .then( () => {
            return res.status(200).send({
                success: true,
                message: "Success Delete Location"
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