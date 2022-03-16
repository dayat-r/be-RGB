const db = require("../models");
const random = require("randomstring");
const {sequelize, Sequelize, order} = require("../models");
require("dotenv").config();
const Order = db.order;
const Sales = db.sales;
const Price = db.priceRef;
const Actual = db.actualStock;
const PriceUse = db.PriceUse;
const Customer = db.customer;
const Pembayaran = db.pembayaran;
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
    saveOrder:async(req,res)=>{
        const dateNow = new Date();
        const dateToday = dateNow.getFullYear() +'-'+ (dateNow.getMonth()+1) + '-' +dateNow.getDate();
        const dateTomorow = new Date();
        dateTomorow.setDate(dateTomorow.getDate() + 1);
        const dateAfter = dateTomorow.getFullYear()+'-'+(dateTomorow.getMonth()+1)+'-'+dateTomorow.getDate();

        let idSales = "SO";

        let nominalPiutang=0;
        async.waterfall([
            (done) => {
                const query = `SELECT id, "idSales", date, "idCustomer", "paymentMethod", note, "limitDate", total, ppn, "ppnStatus", credit, dp, pay, cashback, "createdAt", "updatedAt"
                                    FROM public."Sales"
                                    WHERE "createdAt" BETWEEN  '${dateToday}' AND '${dateAfter}'
                                    ORDER BY id DESC
	                                LIMIT 1
                                 `
        
                client.query(query).then((dataOrder)=>{
                    if (!dataOrder.rows[0]) {
                        idSales += dateNow.getFullYear().toString().substring(2,4);
                        console.log(dateNow.getFullYear().toString().substring(2,4));
                        if(dateNow.getMonth().toString().length < 2){

                            idSales += '0'+dateNow.getMonth().toString();
                        }else{
                            idSales += dateNow.getMonth().toString();
                        }
                        if(dateNow.getDate().toString().length < 2){

                            idSales += '0'+dateNow.getDate().toString();
                        }else{
                            idSales += dateNow.getDate().toString();
                        }
                        idSales += "001";
                    } else {
                        let idSalesOld = dataOrder.rows[0].idSales
                        console.log(idSalesOld);
                        let idBegin = idSalesOld.toString().substring(0,8);
                        let idLast = idSalesOld.toString().substring(8,11);
                        let idLast2 = parseInt(idLast)+1;
                        let idLast3
                        if(idLast2.toString().length == 1){
                            idLast3 = '00'+idLast2.toString();
                        }else if(idLast2.toString().length == 2){
                            idLast3 = '0'+idLast2.toString();
                        }else{
                            idLast3 = idLast2.toString();
                        }

                        idSales = idBegin+idLast3;
                    }
                    done(null,dataOrder)
                });
            },
            (dataOrder,done)=>{
                Sales.create({
                    idSales : idSales,
                    date : dateNow,
                    idCustomer : req.body.idCustomer,
                    paymentMethod : req.body.paymentMethod,
                    note : req.body.note,
                    limitDate : req.body.limitDate,
                    total : req.body.total,
                    ppn : req.body.ppn,
                    ppnStatus : req.body.ppnStatus,
                    ppnCheck : req.body.ppnCheck,
                    credit : req.body.credit,
                    dp : req.body.dp,
                    pay : req.body.pay,
                    cashback : req.body.cashback,
                    userSales : req.body.userSales,
                }).then((saveSales)=>{
                    done(null,dataOrder,saveSales)
                });
            },
            (dataOrder,saveSales,done)=>{
                let dataItem = req.body.dataItem;
                let idOrder = '';
                dataItem.map(async (saveOrder)=>{
                    await Order.create({
                        idSales : idSales,
                        barcode : saveOrder.barcode, 
                        qty : saveOrder.qty,
                        price : saveOrder.price,
                        diskon : saveOrder.diskon,
                        typeDiscount : saveOrder.typeDiscount,
                        location : saveOrder.location,
                    }).then(async(res)=>{
                        idOrder = await res.dataValues.id ;
                    });
                    let qtyOrder = saveOrder.qty;
                    const Prices = await Price.findAll( {
                            where : {
                                barcode : saveOrder.barcode,
                                locCode : saveOrder.location,
                                qtyOut : {
                                    [Op.gt]:0
                                }
                            },
                            order: [
                                ['createdAt', 'ASC'],
                            ],
                        });
                    Prices.forEach(async(res) => {
                        if( res.dataValues.qtyOut <=  qtyOrder &&  qtyOrder !== 0){
                            idPrice =  res.dataValues.idPrice;
                            qtyOrder =  qtyOrder - res.dataValues.qtyOut;
                            Price.update({
                                qtyOut : 0
                            },{
                                where : {
                                    idPrice : idPrice
                                }
                            });
                            PriceUse.create({
                                idOrder : idOrder,
                                idPrice : idPrice,
                                qty : res.dataValues.qtyOut
                            });

                            
                        }else if( res.dataValues.qtyOut > qtyOrder && qtyOrder !== 0){
                            idPrice = res.dataValues.idPrice;
                            PriceUse.create({
                                idOrder : idOrder,
                                idPrice : idPrice,
                                qty : qtyOrder
                            });
                            qtyOrder = res.dataValues.qtyOut- qtyOrder;
                            Price.update({
                                qtyOut : qtyOrder
                            },{
                                where : {
                                    idPrice : idPrice
                                }
                            }).then(()=>{
                            });
                            qtyOrder=0;
                        }
                        
                    })

                    let qtyStock;
                    Actual.findOne({
                        where : {
                            barcode : saveOrder.barcode,
                            locCode : saveOrder.location,
                        }
                    }).then((res)=>{
                        qtyStock = res.dataValues.qty - saveOrder.qty;
                        Actual.update({
                            qty : qtyStock
                        },{
                            where : {
                                barcode : saveOrder.barcode,
                                locCode : saveOrder.location,
                            }
                        });
                    })
                })
                done(null,dataOrder,saveSales)
               
            },
            (dataOrder,saveSales,)=>{
                return res.status(200).send({
                    success: true,
                    idSales: idSales,
                });
            }
        ], (err) => {
            if (err)
                res.status(400).send({
                    success: false,
                    message: `Something is wrong :  ${err}`
                });
        })
    },

    getSalesDetail(req,res){
        const idSales = req.params.id
        async.waterfall([
            (done)=>{
                const query = `SELECT A."idSales",
                                A."date",
                                A."idCustomer",
                                A."note",
                                A."limitDate",
                                A."ppn",
                                A."ppnStatus",
                                A."ppnCheck",
                                A."credit",
                                A."dp",
                                A."pay",
                                A."cashback",
                                A."paymentMethod",
                                A."total",
                                B."name" AS "customerName",
                                B."address" AS "customerAddress",
                                C."name" AS "userName",
                                C."idUser" AS "userSales"
                        FROM "Sales" A 
                        LEFT JOIN "Customers" B
                            ON A."idCustomer" = B."idCustomer"
                        LEFT JOIN "Users" C
                            ON A."userSales" = C."idUser"
                        WHERE A."idSales"= '${idSales}'
                        `
        
                client.query(query).then((dataSales)=>{
                    done(null,dataSales.rows[0])
                });
            },
            (dataSales,done)=>{
                const query = `SELECT A."barcode",
                                A."description",
                                A."merkMobil",
                                A."path",
                                A."price",
                                A."tipeMobil",
                                B."diskon",
                                B."qty",
                                B."typeDiscount",
                                B."location"
                        FROM "Items" A 
                        LEFT JOIN "Orders" B
                            ON A."barcode" = B."barcode"
                        WHERE B."idSales"= '${idSales}'
                        `
        
                client.query(query).then((dataOrder)=>{
                    done(null,dataSales,dataOrder.rows)
                });
                // Order.findAll({
                //     where : {
                //         idSales : idSales
                //     }
                // }).then(dataOrder=>{
                //     done(null,dataSales,dataOrder)
                // });
            },
            (dataSales,dataOrder)=>{
                return res.status(200).send({
                    success: true,
                    sales: dataSales,
                    order: dataOrder,
                });
            }

        ], (err) => {
            if (err)
                res.status(400).send({
                    success: false,
                    message: `Something is wrong :  ${err}`
                });
        })
    },

    getListSales(req,res){
        let cari = req.query['cari'] || '';
        let filter = req.query['filter'];
        let queryFilter='';
        
        if(cari && filter){
            queryFilter = `WHERE A."idSales" ILIKE '%${cari}%' OR
                            B."name" ILIKE '%${cari}%' AND A."paymentMethod" IN (${add(filter)}) OR A."paymentMethod" IN ('${filter}')`
        }else if(filter && !cari){
            queryFilter = `WHERE A."paymentMethod" IN (${add(filter)})`
        }else if(!filter && cari){
            queryFilter = `WHERE A."idSales" ILIKE '%${cari}%' OR
                            B."name" ILIKE '%${cari}%' `
        }else{
            queryFilter='';
        }
        console.log(queryFilter);
        const query = `SELECT A."idSales",
                                A."paymentMethod",
                                A."total",
                                B."name" AS "customerName"
                        FROM "Sales" A 
                        LEFT JOIN "Customers" B
                            ON A."idCustomer" = B."idCustomer"
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
                // res.send(data);
                return res.status(200).send({
                    success: true,
                    message: "Success",
                    data : data.rows
                });
            }
        });
    },
    getListSalesCredit(req,res){
        let cari = req.query['cari'] || '';
        const query = `SELECT A.*,
                                B."name" AS "customerName",
                                C."status"
                        FROM "Sales" A 
                        LEFT JOIN "Customers" B
                            ON A."idCustomer" = B."idCustomer"
                        LEFT JOIN "Alerts" C
                            ON A."idSales" = C."idSales"
                        WHERE B."name" ILIKE '%${cari}%' 
                            AND A."paymentMethod" = 'CREDIT'
                        ORDER BY A."createdAt" DESC
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

    editSales:async(req, res) => {

        const items = req.body.dataItem;

        try {

            const updateSales = await Sales.update({
                idCustomer : req.body.idCustomer,
                paymentMethod : req.body.paymentMethod,
                note : req.body.note,
                limitDate : req.body.limitDate,
                total : req.body.total,
                ppn : req.body.ppn,
                ppnStatus : req.body.ppnStatus,
                ppnCheck : req.body.ppnCheck,
                credit : (req.body.credit) ? req.body.credit : 0,
                dp : (req.body.dp) ? req.body.dp : 0,
                pay : req.body.pay,
                cashback : req.body.cashback,
                userSales : req.body.userSales,
            }, {where: {idSales: req.params.id}});

            if (updateSales) {

                if(req.body.paymentMethod === 'CREDIT'){
                    const updateCustomer = await Customer.update({piutang : sequelize.literal(`"piutang" + ${req.body.credit}`)},{where : {idCustomer : req.body.idCustomer}})
                }
                if(req.body.paymentMethod === 'CASH'){
                    const updateCustomer = await Customer.update({piutang : sequelize.literal(`"piutang" - ${req.body.credit}`)},{where : {idCustomer : req.body.idCustomer}})
                }

                // Cek items on Order whent not exist then delete
                const allItemHistory = await Order.findAll({where: {idSales: req.params.id}});
                
                if (allItemHistory) {
                    const itemsRemove = await Promise.all(allItemHistory.map((item) => {
                        return (items.some(i => i.barcode === item.barcode && i.location === item.location)) ? null : item;
                    }))
                    
                    if (itemsRemove) {
                        await Promise.all(itemsRemove.map( async (item) => {
                            if (item !== null) {
                                
                                const findPriceUse = await Price.findOne({where: {barcode : item.barcode, locCode : item.location,}});

                                if (findPriceUse) {
                                    await Order.destroy({where: {idSales: req.params.id, barcode: item.barcode, location: item.location}})
                                    await Price.update({qtyOut: sequelize.literal(`"qtyOut" + ${item.qty}`)}, {where: {barcode: item.barcode, locCode: item.location}})
                                    await PriceUse.destroy({where: {id: item.id, idPrice: findPriceUse.dataValues.idPrice}})
                                    await Actual.update({
                                        qty : sequelize.literal(`"qty" + ${item.qty}`)
                                    },{
                                        where : {
                                            barcode : item.barcode,
                                            locCode : item.location,
                                        }
                                    });
                                }
                            }
                        }));
                    }
                }

                const itemLoop = await Promise.all(items.map(async (item) => {

                    const itemUpdate = {
                        qty : item.qty,
                        price: item.price,
                        diskon: item.diskon,
                        typeDiscount: item.typeDiscount,
                        location: item.location
                    };

                    const itemsHistory = await Order.findOne({where: {idSales: req.params.id, barcode: item.barcode, location: item.location}});
                    
                    if (itemsHistory) {
                        const updateOrder = await Order.update(itemUpdate, {where: {idSales: req.params.id, barcode: item.barcode, location: item.location}});

                        if (updateOrder && item.qty !== itemsHistory.dataValues.qty) {
                            const resetPrice = await Price.update({qtyOut: sequelize.literal(`"qtyOut" + ${itemsHistory.dataValues.qty}`)}, {where: {barcode: item.barcode, locCode: item.location}})
                            
                            let qtyOrder = item.qty;
                            if (resetPrice) {
                                const Prices = await Price.findAll( {
                                        where : {
                                            barcode : item.barcode,
                                            locCode : item.location,
                                            qtyOut : {
                                                [Op.gt]:0
                                            }
                                        },
                                        order: [
                                            ['createdAt', 'ASC'],
                                        ],
                                    });

                                const priceLoop = await Promise.all(Prices.map(async(res) => {
                                    console.log(res.dataValues);
                                    if( res.dataValues.qtyOut <=  qtyOrder &&  qtyOrder != 0){
                                        idPrice =  res.dataValues.idPrice;
                                        qtyOrder =  qtyOrder - res.dataValues.qtyOut;
                                        const updatePriceRef = await Price.update({
                                            qtyOut : 0
                                        },{
                                            where : {
                                                idPrice : idPrice
                                            }
                                        });

                                        if (updatePriceRef) {
                                            PriceUse.update({
                                                qty : res.dataValues.qtyOut
                                            },{where:{
                                                idOrder : itemsHistory.dataValues.id,
                                                idPrice : idPrice
                                            }});
                                        }
                                    }else if( res.dataValues.qtyOut > qtyOrder && qtyOrder != 0){
                                        idPrice = res.dataValues.idPrice;
                                        const updatePriceUse = await PriceUse.update({
                                            qty : qtyOrder
                                        },{where: {
                                            idOrder : itemsHistory.dataValues.id,
                                            idPrice : idPrice
                                        }});
                                        
                                        if (updatePriceUse) {
                                            qtyOrder = res.dataValues.qtyOut - qtyOrder;
                                            const updatePriceRef = await Price.update({
                                                qtyOut : qtyOrder
                                            },{
                                                where : {
                                                    idPrice : idPrice
                                                }
                                            });
                                            
                                            if (updatePriceRef) qtyOrder=0;
                                        }
                                    }
                                    
                                }))

                                const findActualStock = await Actual.findOne({
                                    where : {
                                        barcode : item.barcode,
                                        locCode : item.location,
                                    }
                                })

                                if (priceLoop, findActualStock) {
                                    let qtyStock
                                    const findPriceStok = await Price.findOne({where: 
                                        {   
                                            barcode : item.barcode,
                                            locCode : item.location
                                        }
                                    });

                                    qtyStock = findPriceStok.dataValues.qtyOut;
                                    
                                    Actual.update({
                                        qty : qtyStock
                                    },{
                                        where : {
                                            barcode : item.barcode,
                                            locCode : item.location,
                                        }
                                    });
                                }
                            }
                        }

                    } else {
                        const insertOrder = await Order.create({idSales: req.params.id, barcode: item.barcode, ...itemUpdate})
                        
                        if (insertOrder) {
                            let qtyOrder = item.qty;
                            const Prices = await Price.findAll( {
                                    where : {
                                        barcode : item.barcode,
                                        locCode : item.location,
                                        qtyOut : {
                                            [Op.gt]:0
                                        }
                                    },
                                    order: [
                                        ['createdAt', 'ASC'],
                                    ],
                                });

                            Prices.forEach(async(res) => {
                                if( res.dataValues.qtyOut <=  qtyOrder &&  qtyOrder != 0){
                                    idPrice =  res.dataValues.idPrice;
                                    qtyOrder =  qtyOrder - res.dataValues.qtyOut;
                                    await Price.update({
                                        qtyOut : 0
                                    },{
                                        where : {
                                            idPrice : idPrice
                                        }
                                    });
                                    await PriceUse.create({
                                        idOrder : insertOrder.dataValues.id,
                                        idPrice : idPrice,
                                        qty : res.dataValues.qtyOut
                                    });
        
                                    
                                }else if( res.dataValues.qtyOut > qtyOrder && qtyOrder != 0){
                                    idPrice = res.dataValues.idPrice;
                                    await PriceUse.create({
                                        idOrder : insertOrder.dataValues.id,
                                        idPrice : idPrice,
                                        qty : qtyOrder
                                    });
                                    qtyOrder = res.dataValues.qtyOut- qtyOrder;
                                    await Price.update({
                                        qtyOut : qtyOrder
                                    },{
                                        where : {
                                            idPrice : idPrice
                                        }
                                    }).then(()=>{
                                        qtyOrder=0;
                                    });
                                }
                                
                            })

                            const findActualStock = await Actual.findOne({
                                where : {
                                    barcode : item.barcode,
                                    locCode : item.location,
                                }
                            })

                            if (findActualStock) {
                                let qtyStock
                                qtyStock = findActualStock.dataValues.qty - item.qty;
                                await Actual.update({
                                    qty : qtyStock
                                },{
                                    where : {
                                        barcode : item.barcode,
                                        locCode : item.location,
                                    }
                                });
                            }
                        }
                    }

                }));

                if (itemLoop) {
                    return res.status(200).json({
                        success: true,
                        message: 'Success Update'
                    })
                }
                
            }

        } catch(error) {
            let stack = error.stack.toString().split(/\r\n|\n/);
            return res.status(500).json({
                success: false,
                message: error.message,
                path: stack[1]
            })
        }
    },

    deleteSales:async (req, res) => {
        const t = await sequelize.transaction();
        try {
            const getPembayaran = await Pembayaran.findAll({
                where : {
                    idSales : req.params.id
                }
            },{transaction:t});

            const getSales = await Sales.findOne({
                    where : {
                        idSales : req.params.id
                    }
                },{transaction:t});

            let deletePembayaran;
            if(await getPembayaran[0]){
                deletePembayaran = await Pembayaran.destroy({
                    where :{
                        idSales : req.params.id
                    }
                },{transaction:t});
            }else{
                deletePembayaran = true;
            }

            let updateCustomer;

            let deleteSales;

            if(await getSales.dataValues.paymentMethod === 'CREDIT'){
                updateCustomer = Customer.update({
                    piutang : sequelize.literal(`"piutang" - ${(getSales.dataValues.total - getSales.dataValues.dp)}`)
                },{
                    where: {
                        idCustomer : getSales.dataValues.idCustomer
                    }
                },{transaction:t});
            }else{
                updateCustomer = true;
            }

           
            
            
            // Cek items on Order whent not exist then delete
            const allItemHistory = await Order.findAll({
                where: {idSales: req.params.id}
            },{transaction:t});

            const ulang = await Promise.all(allItemHistory.map( async (item) => {
                    if (item !== null) {
                        console.log(item);
                            
                        return new Promise(async(resolve, reject)=>{
                            const getPriceUse = await PriceUse.findAll({
                                where: {idOrder : item.id}
                            },{transaction:t});
                            const repeatPriceUse = await getPriceUse.map(async (prices)=>{
                                console.log(prices.id);
                                return new Promise(async(resolve, reject)=>{

                                    const updatePrice = await Price.update({
                                        qtyOut: Sequelize.literal(`"qtyOut" + ${prices.qty}`)
                                    }, {
                                        where: {idPrice : prices.idPrice}
                                    },{transaction:t});

                                    const updatePriceUse = await PriceUse.destroy({
                                        where: {idOrder: item.id, idPrice: prices.idPrice}
                                    },{transaction:t});

                                    if(updatePrice && updatePriceUse){
                                        resolve(prices.id)
                                    }else{
                                        reject('error')
                                    }
                                });

                            })

                           

                            const updateActual = await Actual.update({
                                qty : Sequelize.literal(`"qty" + ${item.qty}`)
                            },{
                                where : {barcode : item.barcode,locCode : item.location}
                            },{transaction:t});
                            
                            const deleteOrder = await Order.destroy({
                                where: {id: item.id}
                            },{transaction:t});

                            if(deleteOrder && updateActual && repeatPriceUse && getPriceUse){
                                resolve(item.id);
                            }else{
                                reject('error');
                            }
                        });
                            

                            

                        }
                    }));
            if(ulang){
                //  Delete From Sales
                deleteSales = await Sales.destroy({
                    where: {idSales: req.params.id}
                },{transaction:t});

            }

            if(ulang && allItemHistory && deleteSales && deletePembayaran && updateCustomer && getSales && getPembayaran ){
                await t.commit();
                return res.status(200).send({
                    success:true,
                    message : 'Success delete Sales',
                });
            }else{
                await t.rollback();
                return res.status(400).send({
                    success:false,
                    message : 'Delete Sales failed 1',
                });
            }

        }catch(error){
            console.log(error);
            await t.rollback();
                return res.status(400).send({
                    success:false,
                    message : 'delete sales failed'
                });
        }

        
    }
}