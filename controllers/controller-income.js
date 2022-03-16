const db = require("../models");
const random = require("randomstring");
require("dotenv").config();
const Income = db.income;
const Cost = db.cost;
const Sales = db.sales; 
const Purchase = db.purchase; 
const Op= db.Sequelize.Op
const async         = require("async");
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
    saveIncome(req,res){
        let data = {
            name: req.body.name,
            noCoa: req.body.noCoa,
            date: req.body.date,
            amount: req.body.amount,
            description: req.body.description,
        };
        Income.create(data)
        .then(() => {
            return res.status(200).send({
                success: true,
                message : "Income save successfuly"
            });
        })
        .catch((err) => {
            res.status(500).send({
                message: "Something is wrong" + err.message,
                success: false
            });
        });
    },
    updateIncome(req,res){
        let data = {
            name: req.body.name,
            noCoa: req.body.noCoa,
            date: req.body.date,
            amount: req.body.amount,
            description: req.body.description,
        };
        Income.update(data,{where : {id:req.params.id}})
        .then((dataRes) => {
            return res.status(200).send({
                success: true,
                message : "Income save successfuly"
            });
        })
        .catch((err) => {
            res.status(500).send({
                message: "Something is wrong" + err.message,
                success: false
            });
        });
    },
    getIncome(req,res){
        let cari = req.query['cari'];

        let paramfix;
        if(cari){
            paramfix = `WHERE B."description" ILIKE '%${cari}%'`;
        }else{
            paramfix = ``;

        }

        const query = `SELECT   A."id",
                                A."date",
                                A."amount",
                                B."description" AS "name"
                        FROM "Incomes" A 
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
    getDashboard(req,res){
        let cari = req.query['cari'] || '';

        async.waterfall([
            (done)=>{
                const query = ` SELECT row_number() OVER () AS "rnum"
                FROM public."purchases" 
                WHERE "date" BETWEEN ('${req.query['startDate']}') AND ('${req.query['endDate']}')
                ORDER BY "rnum" DESC 
                LIMIT 1;
    `
                let row = 0;
                client.query(query).then(async(dataSumPurchase)=>{
                if(dataSumPurchase && dataSumPurchase.rows[0]){
                    row = await  dataSumPurchase.rows[0].rnum
                }
                    done(null,row)
                });
            },
            (dataSumPurchase , done)=>{
                const query = ` SELECT row_number() OVER () AS "rnum"
                    FROM public."Sales" 
                    WHERE "date" BETWEEN ('${req.query['startDate']}') AND ('${req.query['endDate']}')
                    ORDER BY "rnum" DESC 
                    LIMIT 1;
    `
                let row = 0;
                client.query(query).then(async(dataSumSales)=>{
                if(dataSumSales && dataSumSales.rows[0]){
                    row = await  dataSumSales.rows[0].rnum
                }
                    done(null,dataSumPurchase,row)
                });
            },
            (dataSumPurchase,dataSumSales,done)=>{
                Sales.sum('total',{
                    where:{
                        createdAt : {
                            [Op.between]: [req.query['startDate'], req.query['endDate']]
                        }
                    },
                }).then((dataSales)=>{
                    done(null,dataSumPurchase,dataSumSales,dataSales)
                });
            },
            (dataSumPurchase,dataSumSales,dataSales, done)=>{
                Purchase.sum('total',{
                    where:{
                        createdAt : {
                            [Op.between]: [req.query['startDate'], req.query['endDate']]
                        }
                    },
                }).then((dataPurchase)=>{
                    done(null,dataSumPurchase,dataSumSales,dataSales,dataPurchase)
                });
            },
            (dataSumPurchase,dataSumSales,dataSales, dataPurchase,done)=>{

                let date = req.query['startDate'].split('-');


                const query = ` SELECT SUM("total"),EXTRACT(DAY FROM "date") AS "day" 
                                    FROM "Sales" 
                                    WHERE EXTRACT(MONTH FROM "date")='${date[1]}' GROUP BY EXTRACT(DAY FROM "date")

                            `
                let row = 0;
                client.query(query).then(async(dataSalesMonth)=>{
                if(dataSalesMonth && dataSalesMonth.rows[0]){
                    row = await  dataSalesMonth.rows
                }
                    done(null,dataSumPurchase,dataSumSales,dataSales,dataPurchase,row)
                });


            },
            (dataSumPurchase,dataSumSales,dataSales,dataPurchase,dataSalesMonth) => {
                return res.status(200).send({
                    success: true,
                    sumPurchase: parseInt(dataSumPurchase),
                    sumSales: parseInt(dataSumSales),
                    sales: dataSales,
                    purchase: dataPurchase,
                    dataSalesMonth:dataSalesMonth
                });
            }
        ], (err) => {
            if (err)
            console.log(err);
                res.status(400).send({
                    success: false,
                    message: `Something is wrong :  ${err}`
                });
        })
       
        
    },
    getIncomeById(req,res){
        Income.findOne(
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
    deleteIncome(req,res){
        Income.destroy({ where : {id: req.params.id}})
        .then( () => {
            return res.status(200).send({
                success: true,
                message: "Success Delete Income"
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