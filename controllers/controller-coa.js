const db = require("../models");
require("dotenv").config();
const Coa = db.coa;
const Op= db.Sequelize.Op

module.exports = {
    saveCoa(req,res){
        let data = {
            noCoa: req.body.noCoa,
            description: req.body.description
        };
        Coa.create(data)
        .then(() => {
            return res.status(200).send({
                success: true,
                message : "Coa save successfuly"
            });
        })
        .catch((err) => {
            res.status(500).send({
                message: "Something is wrong" + err.message,
                success: false
            });
        });
    },
    updateCoa(req,res){
        let data = {
            noCoa: req.body.noCoa,
            description: req.body.description
        };
        Coa.update(data,{where : {id:req.params.id}})
        .then((dataRes) => {
            return res.status(200).send({
                success: true,
                message : "Coa save successfuly"
            });
        })
        .catch((err) => {
            res.status(500).send({
                message: "Something is wrong" + err.message,
                success: false
            });
        });
    },
    getCoa(req,res){
        let cari = req.query['cari'] || '';
        Coa.findAll(
            {
                where:{
                    description: { [Op.iLike]: `%${cari}%`},
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
    getCoabyNo(req,res){
        console.log(req.query['type']);
        Coa.findAll(
            {
                where:{
                    noCoa: { [Op.between]: [req.query['type'], parseInt(req.query['type'])+999]},
                },
                order:[
                    ['noCoa','DESC']
                ]
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
    getCoaById(req,res){
        Coa.findOne(
            {
                where:{
                    id: req.params.id,
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
    deleteCoa(req,res){
        Coa.destroy({ where : {id: req.params.id}})
        .then( () => {
            return res.status(200).send({
                success: true,
                message: "Success Delete Coa"
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