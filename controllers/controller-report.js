const db = require("../models");
require("dotenv").config();
const Income = db.income;
const Cost = db.cost;
const Sales = db.sales; 
const Purchase = db.purchase; 
const Customer = db.customer; 
const Supplier = db.supplier; 
const PriceRefs = db.priceRef; 
const Order = db.order; 
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
    getDashboardReport(req,res){
        async.waterfall([
            (done)=>{
                Income.sum('amount').then((dataIncome)=>{
                    done(null,dataIncome)
                });
            },
            (dataIncome , done)=>{
                Cost.sum('amount').then((dataCost)=>{
                    done(null,dataIncome,dataCost | 0)
                });
            },
            (dataIncome,dataCost,done)=>{
                Sales.sum('total').then((dataSales)=>{
                    done(null,dataIncome,dataCost,dataSales | 0)
                });

                // const query = ` SELECT SUM(CASE 
                //                         WHEN "paymentMethod" = 'CASH' THEN "pay"
                //                     WHEN "paymentMethod" = 'CREDIT' THEN "dp"
                //                     ELSE "pay"
                //                     END)
                //                 FROM public."Sales";
                //         `
                // let row = 0;
                // client.query(query).then(async(totalSales)=>{
                //     if(totalSales && totalSales.rows[0]){
                //         row = await  totalSales.rows[0].sum
                //     }
                //     done(null,dataIncome,dataCost,row | 0)
                // });
            },
            (dataIncome,dataCost,dataSales, done)=>{
                Purchase.sum('total').then((dataPurchase)=>{
                    done(null,dataIncome,dataCost,dataSales,dataPurchase | 0)
                });
            },
            (dataIncome,dataCost,dataSales,dataPurchase, done)=>{
                Customer.sum('piutang').then((dataCustomer)=>{
                    done(null,dataIncome,dataCost,dataSales,dataPurchase,dataCustomer | 0)
                });
            },
            (dataIncome,dataCost,dataSales,dataPurchase,dataCustomer, done)=>{
                Supplier.sum('hutang').then((dataSupplier)=>{
                    done(null,dataIncome,dataCost,dataSales,dataPurchase,dataCustomer,dataSupplier | 0)
                });
            },
            (dataIncome,dataCost,dataSales,dataPurchase,dataCustomer,dataSupplier, done)=>{
                const query = ` SELECT row_number() OVER () AS "rnum"
                                    FROM public."Sales" 
                                    ORDER BY "rnum" DESC 
                                    LIMIT 1;
                        `
                let row = 0;
                client.query(query).then(async(dataSumSales)=>{
                    if(dataSumSales && dataSumSales.rows[0]){
                        row = await  dataSumSales.rows[0].rnum
                    }
                    done(null,dataIncome,dataCost,dataSales,dataPurchase,dataCustomer,dataSupplier,row | 0)
                });
            },
            (dataIncome,dataCost,dataSales,dataPurchase,dataCustomer,dataSupplier,dataSumSales, done)=>{
                const query = ` SELECT row_number() OVER () AS "rnum"
                                    FROM public."purchases" 
                                    ORDER BY "rnum" DESC 
                                    LIMIT 1;
                        `
                let row = 0;
                client.query(query).then(async(dataSumPurchase)=>{
                    if(dataSumPurchase && dataSumPurchase.rows[0]){
                        row = await  dataSumPurchase.rows[0].rnum
                    }
                    done(null,dataIncome,dataCost,dataSales,dataPurchase,dataCustomer,dataSupplier,dataSumSales,row)
                });
            },
            (dataIncome,dataCost,dataSales,dataPurchase,dataCustomer,dataSupplier,dataSumSales,dataSumPurchase, done)=>{
                const query = ` SELECT sum(
                                            CASE 
                                                WHEN (A."diskon" = 0 AND A."ppnCheck" = false ) THEN (A."qtyOut" * A."priceUnit")
                                                WHEN (A."diskon" = 0 AND A."ppnCheck" = true AND A."ppnStatus"='BEFORE') THEN ((A."qtyOut" * A."priceUnit") + (A."qtyOut" * A."priceUnit" * (A."ppn" / 100)))
                                                WHEN (A."diskon" = 0 AND A."ppnCheck" = true AND A."ppnStatus"='AFTER') THEN ((A."qtyOut" * A."priceUnit")  + (A."qtyOut" * A."priceUnit" * (A."ppn" / 100)))
                                                WHEN (A."diskon" > 0 AND A."typeDiskon" = 'Amount' AND A."ppnCheck" = false ) THEN ((A."qtyOut" * A."priceUnit") - A."diskon" )
                                                WHEN (A."diskon" > 0 AND A."typeDiskon" = 'Percentage' AND A."ppnCheck" = false ) THEN ((A."qtyOut" * A."priceUnit") - ((A."qtyOut" * A."priceUnit") * (A."diskon" / 100)) )
                                                WHEN (A."diskon" > 0 AND A."typeDiskon" = 'Amount' AND A."ppnCheck" = true AND A."ppnStatus"='BEFORE') THEN ((A."qtyOut" * A."priceUnit") - A."diskon" + (A."qtyOut" * A."priceUnit" * (A."ppn" / 100)))
                                                WHEN (A."diskon" > 0 AND A."typeDiskon" = 'Percentage' AND A."ppnCheck" = true AND A."ppnStatus"='BEFORE') THEN ((A."qtyOut" * A."priceUnit") - ((A."qtyOut" * A."priceUnit") * (A."diskon" / 100)) + (A."qtyOut" * A."priceUnit" * (A."ppn" / 100)))
                                                WHEN (A."diskon" > 0 AND A."typeDiskon" = 'Amount' AND A."ppnCheck" = true AND A."ppnStatus"='AFTER') THEN ((A."qtyOut" * A."priceUnit") - A."diskon" + (((A."qtyOut" * A."priceUnit") - A."diskon") * (A."ppn" / 100)))
                                                WHEN (A."diskon" > 0 AND A."typeDiskon" = 'Percentage' AND A."ppnCheck" = true AND A."ppnStatus"='AFTER') THEN ((A."qtyOut" * A."priceUnit") - ((A."qtyOut" * A."priceUnit") * (A."diskon" / 100)) + (((A."qtyOut" * A."priceUnit")-((A."qtyOut" * A."priceUnit")*(A."diskon"/100))) * (A."ppn" / 100)))
                                            END
                                            
                                        ) 
                                    FROM public."PriceRefs" A
                                WHERE A."qtyOut">0
                        `
                let row = 0;
                client.query(query).then(async(dataSumAset)=>{
                    if(dataSumAset && dataSumAset.rows[0]){
                        row = await  dataSumAset.rows[0].sum
                    }
                    done(null,dataIncome,dataCost,dataSales,dataPurchase,dataCustomer,dataSupplier,dataSumSales,dataSumPurchase,row)
                });
            },
            (dataIncome,dataCost,dataSales,dataPurchase,dataCustomer,dataSupplier,dataSumSales,dataSumPurchase,dataSumAset) => {
                return res.status(200).send({
                    success: true,
                    income: dataIncome,
                    cost: dataCost,
                    sales: dataSales,
                    purchase: dataPurchase,
                    customer: dataCustomer,
                    supplier: dataSupplier,
                    sumSales: parseInt(dataSumSales) ,
                    // sumPurchase: dataSumPurchase ,
                    sumPurchase: parseInt(dataSumPurchase) ,
                    sumAset: dataSumAset ,
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

    getSalesReport(req,res){

        const query = ` SELECT A."idSales",
                            A."paymentMethod",
                            A."total",
                            B."name" AS "customer"
                            
                        FROM public."Sales" A
                        INNER JOIN public."Customers" B
                        ON A."idCustomer" = B."idCustomer"
                        
                        WHERE A.date BETWEEN '${req.query['startDate']}' AND '${req.query['endDate']}'

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
        // Sales.findAll({
        //     where:{
        //         date : {
        //             [Op.between]: [req.query['startDate'], req.query['endDate']]
        //         }
        //     },
        // }).then((dataSales)=>{
        //     return res.status(200).send({
        //         success: true,
        //         message: "Success",
        //         data : dataSales
        //     });
        // }).catch(err=>{
        //     console.log(err);
        // });
    },
    getPurchaseReport(req,res){
        const query = ` SELECT A."date",
                            A."paymentMethod",
                            A."total",
                            B."priceUnit",
                            B."qty",
                            C."name" AS "supplier",
                            D."barcode",
                            D."description",
                            B."diskon",
                            B."typeDiskon",
                            B."ppnCheck",
                            B."ppn",
                            B."ppnStatus"
                            
                        FROM public."purchases" A
                        INNER JOIN public."PriceRefs" B
                            ON A."idPrice" = B."idPrice"
                        INNER JOIN public."Suppliers" C
                            ON B."idSupplier" = C."idSupplier"
                        INNER JOIN public."Items" D
                            ON B."barcode" = D."barcode"
                        
                        WHERE A.date BETWEEN '${req.query['startDate']}' AND '${req.query['endDate']}'

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
    getItemSalesReport(req,res){
        const query = ` SELECT B."date",
                            A."barcode",
                            A."qty",
                            A."price",
                            A."diskon",
                            A."typeDiscount"
                            
                        FROM public."Orders" A
                        INNER JOIN public."Sales" B
                        ON A."idSales" = B."idSales"
                        
                        WHERE B.date BETWEEN '${req.query['startDate']}' AND '${req.query['endDate']}'
                        AND A."barcode" = '${req.query['barcode']}'

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
    getDebtReport(req,res){
        const query = ` SELECT 
                            A."name",
                            B."idSales",
                            B."date",
                            B."limitDate",
                            B."total",
                            B."dp",
                            B."credit"
                            
                        FROM public."Customers" A
                        INNER JOIN public."Sales" B
                        ON A."idCustomer" = B."idCustomer"
                        
                        WHERE B.date BETWEEN '${req.query['startDate']}' AND '${req.query['endDate']}'

                         AND A."piutang" > 0
                         AND B."paymentMethod" = 'CREDIT'

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
    getArReport(req,res){
        const query = ` SELECT 
                            D."name",
                            A."date",
                            A."limitDate",
                            A."total",
                            A."dp",
                            C."description",
                            C."merkMobil",
                            C."tipeMobil"
                            
                        FROM public."purchases" A
                        INNER JOIN public."PriceRefs" B
                            ON A."idPrice" = B."idPrice"
                        INNER JOIN public."Items" C
                            ON B."barcode" = C."barcode"
                        INNER JOIN public."Suppliers" D
                            ON B."idSupplier" = D."idSupplier"
                        
                        WHERE A.date BETWEEN '${req.query['startDate']}' AND '${req.query['endDate']}'

                         AND D."hutang" > 0
                         AND A."paymentMethod" = 'CREDIT'

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
    getIsReport(req,res){
        async.waterfall([
            (done)=>{
                Sales.sum('total',{
                    where:{
                        date : {
                            [Op.between]: [req.query['startDate'], req.query['endDate']]
                        }
                    },
                }).then((dataSales)=>{
                    done(null,dataSales | 0)
                });
            },
            (dataSales, done)=>{
                const query = ` SELECT SUM( COALESCE(A."priceUnit",0) * COALESCE(B."qty",0) + (( COALESCE(D."ppn",0) / 100) * (COALESCE(A."priceUnit",0) * COALESCE(B."qty",0))))
                                FROM public."PriceRefs" A
                                LEFT JOIN public."PriceUses" B
                                    ON A."idPrice" = B."idPrice"
                                LEFT JOIN public."Orders" C
                                    ON C."id" = B."idOrder"
                                LEFT JOIN public."Sales" D
                                    ON  C."idSales" = D."idSales"
                                WHERE D.date BETWEEN '${req.query['startDate']}' AND '${req.query['endDate']}'
                                

                        `

                let row= 0;
                client.query(query).then(async(dataHargaPokok)=>{
                    if(dataHargaPokok && dataHargaPokok.rows[0]){
                        row = await dataHargaPokok.rows[0].sum;
                    }
                    done(null,dataSales,row)
                });
            },
            (dataSales,dataHargaPokok, done)=>{
                const query = ` SELECT  B."noCoa",
                                        B."description" AS "name",
                                        SUM (A."amount") AS "amount"
                                FROM "Costs" A 
                                LEFT JOIN "Coas" B
                                    ON A."noCoa" = B."noCoa"

                                WHERE A.date BETWEEN '${req.query['startDate']}' AND '${req.query['endDate']}'


                                GROUP BY B."noCoa",B."description","amount"
                        `

                let row;
                client.query(query).then(async(dataPengeluaran)=>{
                    if(dataPengeluaran ){
                        row = await dataPengeluaran.rows;
                    }
                    // done(null,dataSales,row)
                    done(null,dataSales,dataHargaPokok,row)
                });
            },
            (dataSales,dataHargaPokok,dataPengeluaran,done)=>{
                Cost.sum('amount',{
                    where:{
                        date : {
                            [Op.between]: [req.query['startDate'], req.query['endDate']]
                        }
                    },
                }).then((dataSumPengeluaran)=>{
                    done(null,dataSales,dataHargaPokok,dataPengeluaran,dataSumPengeluaran | 0)
                });
            },
            (dataSales,dataHargaPokok,dataPengeluaran,dataSumPengeluaran) => {
                return res.status(200).send({
                    success: true,
                    sales: dataSales,
                    hargaPokok: dataHargaPokok,
                    pengeluaran : dataPengeluaran,
                    sumPengeluaran : dataSumPengeluaran
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



      
}