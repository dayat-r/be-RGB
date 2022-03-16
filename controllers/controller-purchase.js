const db = require("../models");
const random = require("randomstring");
const {sequelize} = require("../models");
require("dotenv").config();
const Price = db.priceRef;
const Purchase = db.purchase;
const ActualStock = db.actualStock;
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

module.exports = {
    getListPurchase(req,res){
        let filter = req.query['filter'];
        let queryFilter='';
        
        if(filter ){
            queryFilter = `WHERE A."paymentMethod" IN (${add(filter)})`
        }else{
            queryFilter='';
        }
        const query = `SELECT A.*,
                            C."name" AS "nameSupplier"
                        FROM "purchases" A 
                        LEFT JOIN "PriceRefs" B
                            ON A."idPrice" = B."idPrice"
                        LEFT JOIN "Suppliers" C
                            ON B."idSupplier" = C."idSupplier"
                        ${queryFilter}
                        ORDER BY A."createdAt" DESC

                        
                        `
        
        client.query(query).then((data)=>{
            if (data === null) {
                return res.status(400).send({
                    success: false,
                    message: "No data !"
                });
            } else {
                return res.status(200).send({
                    success: true,
                    message: "Success",
                    data : data.rows
                });
            }
        });
       
    },
    getListPurchaseCredit(req,res){

        let cari = req.query['cari'];
        let queryFilter = `WHERE A."paymentMethod" IN (${add('CREDIT')})`
        
        const query = `SELECT A.*,
                            C."name" AS "nameSupplier",
                            C."idSupplier",
                            D."status"
                        FROM "purchases" A 
                        LEFT JOIN "PriceRefs" B
                            ON A."idPrice" = B."idPrice"
                        LEFT JOIN "Suppliers" C
                            ON B."idSupplier" = C."idSupplier"
                        LEFT JOIN "Alerts" D
                            ON A."id" = D."idPurchase"
                        ${queryFilter}

                        AND C."name" ILIKE '%${cari}%'
                        ORDER BY A."createdAt" DESC

                        
                        `
        
        client.query(query).then((data)=>{
            if (data === null) {
                return res.status(400).send({
                    success: false,
                    message: "No data !"
                });
            } else {
                return res.status(200).send({
                    success: true,
                    message: "Success",
                    data : data.rows
                });
            }
        });
       
    },

    getPurchaseById(req,res){
        const query = `SELECT B."barcode",
                                    B."idSupplier",
                                    B."locCode",
                                    B."diskon",
                                    B."ppn",
                                    B."ppnCheck",
                                    B."ppnStatus",
                                    B."priceUnit",
                                    B."qty",
                                    B."qtyOut",
                                    B."typeDiskon",
                                    C."description",
                                    C."merkMobil",
                                    C."tipeMobil",
                                    C."path",
                                    C."merk",
                                    D."name" AS "nameSupplier",
                                    E."name" AS location,
                                    A."date",
                                    A."credit",
                                    A."dp",
                                    A."limitDate",
                                    A."paymentMethod",
                                    A."total"
                        FROM "purchases" A 
                        LEFT JOIN "PriceRefs" B
                            ON A."idPrice" = B."idPrice"
                        LEFT JOIN "Items" C
                            ON B."barcode" = C."barcode"
                        LEFT JOIN "Suppliers" D
                            ON D."idSupplier" = B."idSupplier"
                        LEFT JOIN "LocationCodes" E
                            ON E."locCode" = B."locCode"

                        WHERE A."id" = ${req.params.id}
                        `
        
        client.query(query).then((data)=>{
            if (data === null) {
                return res.status(400).send({
                    success: false,
                    message: "No data !"
                });
            } else {
                return res.status(200).send({
                    success: true,
                    message: "Success",
                    dataPurchase : data.rows[0]
                });
            }
        });
    
       
    },

    deletePurchase:async(req,res)=>{
        const t = await sequelize.transaction();
        try {
            const getPurchase = await Purchase.findOne({
                where : {
                    id : req.params.id
                }
            },{transaction:t});

            const deletePurchase = await Purchase.destroy({
                where : {
                    id : req.params.id
                }
            },{transaction:t});

            const getPriceRefs = await Price.findOne({
                where : {
                    idPrice : getPurchase.dataValues.idPrice
                }
            },{transaction:t});

            const deletePriceRefs = await Price.destroy({
                where:{
                    idPrice : getPurchase.dataValues.idPrice
                }
            },{transaction:t});

            const getActual = await ActualStock.findOne({
                where : {
                    locCode : getPriceRefs.dataValues.locCode,
                    barcode : getPriceRefs.dataValues.barcode
                }
            },{transaction:t});

            const updateActual = await ActualStock.update({
                qty : getActual.dataValues.qty - getPriceRefs.dataValues.qty
            },{
                where : {
                    locCode : getPriceRefs.dataValues.locCode,
                    barcode : getPriceRefs.dataValues.barcode
                }
            },{transaction:t});


            
            if(getPurchase && deletePurchase && getPriceRefs && deletePriceRefs && getActual && updateActual ){
                await t.commit();
                return res.status(200).send({
                    success:true,
                    message : 'Success delete purchase',
                });
            }else{
                await t.rollback();
                return res.status(400).send({
                    success:false,
                    message : 'Delete purchase failed 1',
                });
            }
        } catch (error) {
            await t.rollback();
            console.log(error);
            return res.status(400).send({
                success:false,
                message : 'Delete purchase failed',
            });
        }
    }
    
    

      
}