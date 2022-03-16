const db = require("../models");
const random = require("randomstring");
require("dotenv").config();
const Cost = db.cost;
const Op= db.Sequelize.Op;
const {Pool}                    = require('pg');

const {HOST, USER, PASSWORD, DB}    = require('../configs/database');
const client = new Pool({
    user: USER,
    host: HOST,
    database: DB,
    password: PASSWORD,
    port: 5432,
});

module.exports = {
    saveCost(req,res){
        let data = {
            name: req.body.name,
            date: req.body.date,
            amount: req.body.amount,
            noCoa : req.body.noCoa,
            description: req.body.description,
        };
        Cost.create(data)
        .then(() => {
            return res.status(200).send({
                success: true,
                message : "Cost save successfuly"
            });
        })
        .catch((err) => {
            res.status(500).send({
                message: "Something is wrong" + err.message,
                success: false
            });
        });
    },
    updateCost(req,res){
        let data = {
            name: req.body.name,
            date: req.body.date,
            amount: req.body.amount,
            noCoa : req.body.noCoa,
            description: req.body.description,
        };
        Cost.update(data,{where : {id:req.params.id}})
        .then((dataRes) => {
            return res.status(200).send({
                success: true,
                message : "Cost save successfuly"
            });
        })
        .catch((err) => {
            res.status(500).send({
                message: "Something is wrong" + err.message,
                success: false
            });
        });
    },
    getCost(req,res){

        let cari = req.query['cari'];

        let paramfix;
        if(cari){
            paramfix = `WHERE B."description" ILIKE '%${cari}%'`;
        }else{
            paramfix = ``;

        }

        const query = `SELECT 
                                A."id",
                                A."date",
                                A."amount",
                                B."description" AS "name"
                        FROM "Costs" A 
                        LEFT JOIN "Coas" B
                            ON A."noCoa" = B."noCoa"
                        ${paramfix}
                        ORDER BY A."noCoa" DESC


                        `
        
        client.query(query).then((data)=>{
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
                    data : data.rows
                });
            }
        });
    },
    getCostById(req,res){
        Cost.findOne(
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
    deleteCost(req,res){
        Cost.destroy({ where : {id: req.params.id}})
        .then( () => {
            return res.status(200).send({
                success: true,
                message: "Success Delete Cost"
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