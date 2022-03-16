const db = require("../models");
const random = require("randomstring");
const {sequelize, priceRef} = require("../models");
require("dotenv").config();
const ActualStock = db.actualStock;
const Price = db.priceRef;
const Purchase = db.purchase;
const Supplier = db.supplier;
const Transfer = db.TransferItem;
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

module.exports = {
    reStockProduct:async(req,res)=>{
        const t = await sequelize.transaction();
        try {
            const createPrice = await Price.create({
                idPrice : random.generate(),
                priceUnit : req.body.priceUnit,
                locCode : req.params.id,
                barcode : req.body.barcode,
                ppn : req.body.ppn,
                ppnStatus : req.body.ppnStatus,
                ppnCheck : req.body.ppnCheck,
                qty : req.body.qty,
                qtyOut : req.body.qty,
                diskon : req.body.diskon,
                typeDiskon : req.body.typeDiskon,
                idSupplier : req.body.idSupplier
            },{transaction:t});

            

            const getActual = await ActualStock.findOne({
                where : {
                    locCode : req.params.id,
                    barcode : req.body.barcode
                }
            },{transaction:t});
                
           
            let qtyOld= await getActual.dataValues.qty;

            const updateActual = await  ActualStock.update({
                qty : await qtyOld + req.body.qty

            },{where : 
                { locCode : req.params.id ,barcode : req.body.barcode},
            },{transaction:t});

            let idPrice1 = await createPrice.dataValues.idPrice;

            const createPurchase = await Purchase.create({
                idPrice : idPrice1,
                paymentMethod : req.body.paymentMethod,
                date : req.body.date,
                limitDate : req.body.limitDate,
                total : req.body.total,
                dp : req.body.dp,
                credit : req.body.credit,
            });

            

            if( createPrice && getActual && updateActual && createPurchase ){
                await t.commit();
                return res.status(200).send({
                    success:true,
                    message : 'Success restock Product',
                });
            }else{
                await t.rollback();
                return res.status(400).send({
                    success:false,
                    message : 'Restock product failed1',
                });
            }
        } catch (error) {
            await t.rollback();
            console.log(error);
            return res.status(400).send({
                success:false,
                message : 'Restock product failed',
            });
        }
        
    },
    getActualByBarcode(req,res){
        let queryparams = '';
        if(req.query['all']){
            queryparams = '';
        }else{
            queryparams = `AND B."deptCode" = '${req.user.deptCode}'`
        }

        const query = `SELECT 
                            A."id",
                            A."locCode",
                            A."qty",
                            B."name",
                            (
                                SELECT 
                                "priceUnit" AS "priceUnit"
                            FROM
                                "PriceRefs" D
                                WHERE D."barcode" = '${req.params.barcode}' AND D."locCode" = A."locCode"
                                ORDER BY D."priceUnit" DESC
                                LIMIT 1
                            )
                        FROM "ActualStocks" A
                        INNER JOIN "LocationCodes" B
                        ON A."locCode" = B."locCode" 

                        WHERE A."barcode" = '${req.params.barcode}'

                        

                        ${queryparams}

                        ORDER BY A."id" ASC

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
        })
        
    },
    tranferProduct:async(req,res)=>{
        const t = await sequelize.transaction();


        try {
            idPriceArrGo = [];
            idPriceArrTo = [];
            let qtyTranfer = req.body.qty;

            const dataPriceRef = await Price.findAll({
                where : {
                    barcode : req.params.barcode,
                    locCode : req.body.location,
                    qtyOut: {
                                [Op.gt] : 0
                            }
                    },
                order:[
                    ['createdAt','ASC']
                ]
            },{transaction:t})

            const cekOldLoc = await ActualStock.findAll({
                where : {
                    barcode : req.body.barcode,
                    locCode : req.body.location
                }
            },{transaction:t});


            const updateOldActual = await ActualStock.update({
                qty : cekOldLoc[0].dataValues.qty - req.body.qty
            },{where : {
                barcode : req.body.barcode,
                locCode : req.body.location
            }},{transaction:t});

            const cekNewLoc = await ActualStock.findAll({
                where : {
                    barcode : req.body.barcode,
                    locCode : req.body.locationTo
                }
            },{transaction:t});

            const updateNewActual = await ActualStock.update({
                qty : cekNewLoc[0].dataValues.qty + req.body.qty
            },{where : {
                barcode : req.body.barcode,
                locCode : req.body.locationTo
            }},{transaction:t});


            

            const ulang = await Promise.all(dataPriceRef.map(async(res)=>{
                if(qtyTranfer>0){
                   if(qtyTranfer<=res.qtyOut){
                        const jumQty = res.qtyOut - qtyTranfer;
                        Price.update({
                            qtyOut : jumQty
                        },{
                            where : {
                                idPrice : res.idPrice
                            }
                        },{transaction:t});
                        qtyTranfer = 0;
                        idPriceArrGo.push(res.idPrice);

                        const rand = await random.generate();
                        await Price.create({
                            idPrice : rand,
                            locCode : req.body.locationTo,
                            barcode : res.barcode,
                            priceUnit : res.priceUnit,
                            qty : req.body.qty,
                            qtyOut : req.body.qty,
                            typeDiskon : res.typeDiskon,
                            diskon : res.diskon,
                            ppn : res.ppn,
                            ppnStatus : res.ppnStatus,
                            ppnCheck : res.ppnCheck,
                            idSupplier : res.idSupplier,
                        },{transaction:t});
                        idPriceArrTo.push(await rand);
                   }else{
                        const sisaQty = await  qtyTranfer - res.qtyOut;
                        await Price.update({
                            qtyOut : jumQty
                        },{
                            where : {
                                idPrice : res.idPrice
                            }
                        },{transaction:t});
                        qtyTranfer = sisaQty;
                        idPriceArrGo.push(res.idPrice);

                        const rand = await random.generate();

                        await Price.create({
                            idPrice : rand,
                            locCode : res.locationTo,
                            barcode : res.barcode,
                            priceUnit : res.priceUnit,
                            qty : res.qty,
                            qtyOut : res.qty,
                            typeDiskon : res.typeDiskon,
                            diskon : res.diskon,
                            ppn : res.ppn,
                            ppnStatus : res.ppnStatus,
                            ppnCheck : res.ppnCheck,
                            idSupplier : res.idSupplier,
                        },{transaction:t});
                        idPriceArrTo.push(await rand);
                   }
                }
            }))


            const createTransfer = await Transfer.create({
                date : new Date(),
                idPriceGo : idPriceArrGo.toString(),
                idPriceTo : idPriceArrTo.toString(),
                qty : req.body.qty
            },{transaction:t})

            if( dataPriceRef && createTransfer && ulang && cekNewLoc && cekOldLoc && updateOldActual && updateNewActual){
                await t.commit();
                return res.status(200).send({
                    success:true,
                    message : 'Success transfer Product',
                });
            }else{
                await t.rollback();
                return res.status(400).send({
                    success:false,
                    message : 'Restock product failed1',
                });
            }
            
            
        } catch (error) {
            await t.rollback();
            console.log(error);
            return res.status(400).send({
                success:false,
                message : 'Restock product failed',
            });
        }
    }


      
}