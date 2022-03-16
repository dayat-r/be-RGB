const db = require("../models");
require("dotenv").config();
const Alert = db.alert;
const Op= db.Sequelize.Op

const async         = require("async");
const {Pool}                    = require('pg');
require("dotenv").config();

const {HOST, USER, PASSWORD, DB}    = require('../configs/database');
const client = new Pool({
    user: USER,
    host: HOST,
    database: DB,
    password: PASSWORD,
    port: 5432,
});

function add(data){
    const dataSplit = data.split(",");
    let dataDone="";
    dataSplit.map((res,index)=>{
        if(index+1 == dataSplit.length){
            dataDone+="'"+res+"'";
        }else{
            dataDone+="'"+res+"',";
        }
        
    })
    return dataDone;
}

function pad2(n) {
    return (n < 10 ? '0' : '') + n;
  }
module.exports = {
    saveAlert(req,res){
        let data = {
            date: new Date(),
            description: req.body.description,
            type: req.body.type,
            idSales: req.body.idSales,
            idPurchase: req.body.idPurchase,
            status: true,
        };
        Alert.create(data)
        .then(() => {
            return res.status(200).send({
                success: true,
                message : "Alert save successfuly"
            });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({
                message: "Something is wrong" + err.message,
                success: false
            });
        });
    },
    updateAlert(req,res){
        let data = {
            status: req.body.status,
        };
        Alert.update(data,{where : {id:req.params.id}})
        .then((dataRes) => {
            return res.status(200).send({
                success: true,
                message : "Alert save successfuly"
            });
        })
        .catch((err) => {
            res.status(500).send({
                message: "Something is wrong" + err.message,
                success: false
            });
        });
    },
    getAlert(req,res){
        let cari = req.query['cari'] || '';
        Alert.findAll(
            {
                where:{
                    description: { [Op.iLike]: `%${cari}%`},
                },
                order : [
                    ['status','DESC']
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
    getAlertActive(req,res){
        Alert.findAll(
            {
                where:{
                    status: true,
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

    
   
    getAlertById(req,res){
        Alert.findOne(
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
    // getAlertByIdPurchase(req,res){
    //     Alert.findOne(
    //         {
    //             where:{
    //                 idPurchase: req.params.id,
    //             },
    //         }
    //     )
    //     .then((data) => {
    //         if (data === null) {
    //             return res.status(400).send({
    //                 success: false,
    //                 message: "No data !"
    //             });
    //         } else {
    //             // res.send(data);
    //             return res.status(200).send({
    //                 success: true,
    //                 message: "Success",
    //                 data : data
    //             });
    //         }
    //     })
    //     .catch((err) => {
    //         res.status(500).send({
    //             message: "Something is wrong" + err.message,
    //             success: false
    //         });
    //     });
    // },
    deleteAlert(req,res){
        Alert.destroy({ where : {id: req.params.id}})
        .then( () => {
            return res.status(200).send({
                success: true,
                message: "Success Delete Alert"
            });
        })
        .catch( (err) => {
            res.status(500).send({
                message: "Something is wrong" + err.message,
                success: false
            });
        });
    },

    checkDate(req,res){
        var date = new Date();
        date.setDate(date.getDate()+1);
        var month = pad2(date.getMonth()+1);//months (0-11)
        var day = pad2(date.getDate());//day (1-31)
        var year= date.getFullYear();
        async.waterfall([
            (done)=>{
                let paramfix='';

                if(req.query['filterPurchase']){
                    paramfix = `AND A."id" NOT IN (${add(req.query['filterPurchase'])})`;
                }else{
                    paramfix = ''
                }


                const query = `SELECT A.*,
                                C."name" AS "nameSupplier"
                        FROM "purchases" A
                        LEFT JOIN "PriceRefs" B
                            ON A."idPrice" = B."idPrice"
                        LEFT JOIN "Suppliers" C
                            ON B."idSupplier" = C."idSupplier"
                        
                        WHERE "paymentMethod" = 'CREDIT' AND "limitDate" < '${year}-${month}-${day}'
                        ${paramfix}
                        ORDER BY A."createdAt" DESC
                        `
        
                client.query(query).then((dataPurchase)=>{
                    done(null,dataPurchase.rows)
                });
            },
            (dataPurchase,done)=>{
                if(req.query['filterSales']){
                    paramfix = `AND A."idSales" NOT IN (${add(req.query['filterSales'])})`;
                }else{
                    paramfix = ''
                }
                const query = `SELECT *
                        FROM "Sales" A
                        
                        WHERE "paymentMethod" = 'CREDIT' AND "limitDate" < '${year}-${month}-${day}'
                        ${paramfix}
                        ORDER BY A."createdAt" DESC
                        `
        
                client.query(query).then((dataSales)=>{
                    done(null,dataPurchase,dataSales.rows)
                });
            },
            (dataPurchase,dataSales)=>{
                return res.status(200).send({
                    success: true,
                    dataPurchase: dataPurchase,
                    dataSales: dataSales,
                });
            }
        ], (err) => {
            if (err)
                res.status(400).send({
                    success: false,
                    message: `Something is wrong :  ${err}`
                });
        })

        
        
    }

      
}