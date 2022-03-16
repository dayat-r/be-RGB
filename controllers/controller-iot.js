const db = require("../models");
const random = require("randomstring");
require("dotenv").config();
const Iot = db.iot;
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
    saveIot(req,res){
        let data = {
            status: req.body.status,
            value: req.body.value || 0,
            name: req.body.name || ''
        };
        Iot.create(data)
        .then(() => {
            return res.status(200).send({
                success: true,
                message : "Iot save successfuly"
            });
        })
        .catch((err) => {
            res.status(500).send({
                message: "Something is wrong" + err.message,
                success: false
            });
        });
    },
    updateIot(req,res){
        let data = {
            status: req.body.status,
            value: req.body.value || 0,
            name: req.body.name || ''
        };
        Iot.update(data,{where : {id:req.params.id}})
        .then((dataRes) => {
            return res.status(200).send({
                success: true,
                message : "Iot save successfuly"
            });
        })
        .catch((err) => {
            res.status(500).send({
                message: "Something is wrong" + err.message,
                success: false
            });
        });
    },
    getIot(req,res){

        const query = `SELECT 
                                A."id",
                                A."name",
                                A."status",
                                A."value" 
                        FROM "Iots" A 


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
    appGetIotByIdDevice(req,res){
        const query = `SELECT 
                                A."id",
                                A."status",
                                A."name",
                                A."value"
                        FROM "Iots" A 

                        WHERE A."idDevice" = '${req.params.id}'

                        ORDER BY A."id" 


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
                    status:200,
                    data : data.rows,
                    count : data.rows.length
                });
            }
        });
    },
    getIotByIdDevice(req,res){
        const query = `SELECT 
                                A."id",
                                A."status"
                        FROM "Iots" A 

                        WHERE A."idDevice" = '${req.params.id}'
                        GROUP BY "id","status"

                        ORDER BY "id" ASC


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
                    status:200,
                    data : data.rows,
                    count : data.rows.length
                });
            }
        });
    },
    deleteIot(req,res){
        Iot.destroy({ where : {id: req.params.id}})
        .then( () => {
            return res.status(200).send({
                success: true,
                message: "Success Delete Iot"
            });
        })
        .catch( (err) => {
            res.status(500).send({
                message: "Something is wrong" + err.message,
                success: false
            });
        });
    },
    updateFromBrowser(req,res){
        const query = `UPDATE "Iots" SET
                            "status"=${req.query['status']}

                        WHERE "id" = '${req.params.id}'


                        `
        
        client.query(query).then((data)=>{
            return res.status(200).send({
                success: true,
                status:200,
            });
        });
    },
    updateFromApp(req,res){

        let status = req.body.status;
        let idDevice = req.params.id;
        let id = req.body.id;
        const query = `UPDATE "Iots" SET
                            "status"=${status}

                        WHERE "id" = '${id}' AND "idDevice" = ${idDevice}
                        `
        
        client.query(query).then((data)=>{
            return res.status(200).send({
                success: true,
                status:200,
            });
        });
    },

      
}