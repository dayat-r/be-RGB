const db = require("../models");
const {sequelize} = require("../models");
const {Pool}                    = require('pg');
require("dotenv").config();
const Item = db.item;
const LocCode = db.locationCode;
const ActualStock = db.actualStock;
const Price = db.priceRef;
const Op= db.Sequelize.Op
const async         = require("async");
const fs = require('fs');
const random = require("randomstring");

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



// let permArr = [];
// let usedChars = [];
// function permute(input) {
//   var i, ch="";
//   for (i = 0; i < input.length; i++) {
//     ch = input.splice(i, 1)[0];
//     usedChars.push(ch);
//     if (input.length == 0) {
//       permArr.push(usedChars.slice());
//     }
//     permute(input);
//     input.splice(i, 0, ch);
//     usedChars.pop();
//   }
//   return permArr
// };
function permute(permutation) {
    var length = permutation.length,
        result = [permutation.slice()],
        c = new Array(length).fill(0),
        i = 1, k, p;
  
    while (i < length) {
      if (c[i] < i) {
        k = i % 2 && c[i];
        p = permutation[i];
        permutation[i] = permutation[k];
        permutation[k] = p;
        ++c[i];
        i = 1;
        result.push(permutation.slice());
      } else {
        c[i] = 0;
        ++i;
      }
    }
    return result;
  }
  
function minus(input){
    var arr = [];
    var start = 0;
    while(start<input){
        arr.push(start);
        start++;
    }
    return arr;
       
}


module.exports = {
    saveItem: async (req,res)=>{
        const t = await sequelize.transaction();
        try {
            const saveItem = await Item.create({
                barcode: req.body.barcode,
                idSupplier: req.body.idSupplier,
                merkMobil: req.body.merkMobil,
                tipeMobil: req.body.tipeMobil,
                description: req.body.description,
                description2: req.body.description2,
                merk: req.body.merk,
                path: req.body.path | null,
                price: req.body.price | 0,
            },{transaction:t});

            const dataLocCode = await LocCode.findAll({transaction:t});
            const dataLoc = [];
            await dataLocCode.map(async loc =>{
                await dataLoc.push(loc.dataValues)
            })
            dataLoc.map(loc =>{
                ActualStock.create({
                    barcode : req.body.barcode,
                    locCode : loc.locCode,
                    idPrice :'',
                    qty : 0
                })
            },{transaction:t})

            if(saveItem && dataLocCode ){
                await t.commit();
                return res.status(200).send({
                    success:true,
                    message : 'Success add Product',
                });
            }else{
                await t.rollback();
                return res.status(400).send({
                    success:false,
                    message : 'Add product failed 1',
                });
            }
        } catch (error) {
            console.log(error);
            await t.rollback();
                return res.status(400).send({
                    success:false,
                    message : 'Add product failed',
                });
        }
    },
    getItem:async(req,res)=>{
        let cari = req.query['cari'] || '';
        let filter = req.query['filter'];
        let queryFilter='';
        
       


        let lastId = req.query['lastId'] | 0;
        
        if(cari && filter){
            queryFilter = `WHERE (C."description" ILIKE '%${req.query['cari']}%' OR
                            C."tipeMobil" ILIKE '%${req.query['cari']}%' OR
                            C."name" ILIKE '%${req.query['cari']}%')
                            AND C."merkMobil" in (${add(filter)})`
        }else if(filter && !cari){
            queryFilter = `WHERE C."merkMobil" in (${add(filter)})`
        }else if(!filter && cari){
            queryFilter = `WHERE C."description" ILIKE '%${req.query['cari']}%' OR
                            C."tipeMobil" ILIKE '%${req.query['cari']}%' 
                            `
        }else{
            queryFilter='';
        }

        const query = `WITH Item AS 
                        (
                            WITH Item1 AS (
                                SELECT row_number() OVER (ORDER BY A."createdAt" DESC) AS "rownumber",
                                A."barcode",
                                A."description",
                                A."description2",
                                A."merk",
                                A."idSupplier",
                                A."tipeMobil",
                                A."path",
                                A."price",
                                A."createdAt",
                                B."name" AS "merkMobil",
                                (
                                    SELECT
                                    SUM (qty) AS total
                                FROM
                                    "ActualStocks"
                                    WHERE barcode = A."barcode"
                                )
                            FROM "Items" A 
                            LEFT JOIN "Merks" B
                                ON A."merkMobil" = B."kodeMerk"
                            )

                            SELECT * FROM Item1 C
                            

                            ${queryFilter}
                        )
                        SELECT * FROM Item WHERE "rownumber" > ${lastId}
                        ORDER BY Item."rownumber" ASC
                        LIMIT 20


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
    updateItem(req,res){
        let data = {
            idSupplier: req.body.idSupplier,
            merkMobil: req.body.merkMobil,
            tipeMobil: req.body.tipeMobil,
            description: req.body.description,
            description2: req.body.description2,
            merk: req.body.merk,
            path: req.body.path,
            price: req.body.price,
        };
        Item.update(data,{where : {barcode:req.params.barcode}})
        .then((dataRes) => {
            return res.status(200).send({
                success: true,
                message : "Item update successfuly"
            });
        })
        .catch((err) => {
            res.status(500).send({
                message: "Something is wrong" + err.message,
                success: false
            });
        });
    },
    getItemById(req,res){

        async.series([
            (done)=>{
                const rows= [];
                const query = `SELECT A."barcode",
                                A."description",
                                A."description2",
                                A."merk",
                                A."merkMobil",
                                A."tipeMobil",
                                A."path",
                                A."price",
                                B."name" AS "namaMerkMobil",
                        (
                            SELECT
                            SUM (qty) AS total
                        FROM
                            "ActualStocks"
                            WHERE barcode = A."barcode"
                        )
                        FROM "Items" A 
                        LEFT JOIN "Merks" B
                        ON A."merkMobil" = B."kodeMerk"

                        WHERE A."barcode" = '${req.params.barcode}'

                        `
                
                client.query(query).then((data)=>{
                    if (data === null) {
                        done(null,data);
                    } else {

                        rows.push(data.rows[0])
                        done(null,rows);
                    }
                });
            },
            (done)=>{
                const query = `SELECT A."barcode",
                                A."createdAt",
                                A."priceUnit",
                                A."qty",
                                A."qtyOut",
                                A."diskon",
                                A."typeDiskon",
                                A."ppnCheck",
                                A."ppn",
                                A."ppnStatus",
                                B."name" AS "supplier"
                       
                                FROM "PriceRefs" A 
                                LEFT JOIN "Suppliers" B
                                    ON A."idSupplier" = B."idSupplier"

                                WHERE A."barcode" = '${req.params.barcode}'
                                    AND A."qtyOut" > 0

                                ORDER BY A."id" DESC

                                `
                
                client.query(query).then((data)=>{
                    if (data === null) {
                        done(null,data);
                    } else {
                        done(null,data.rows);
                    }
                });
            },
            (done)=>{

                const rows= [];
                const query = `SELECT 
                                A."qty",
                                B."name" As "location"
                        FROM "ActualStocks" A 
                        INNER JOIN "LocationCodes" B
                        ON A."locCode" = B."locCode"

                        WHERE A."barcode" = '${req.params.barcode}'

                        AND B."deptCode" = '${req.user.deptCode}'

                        ORDER BY A."id" ASC

                        `
                
                client.query(query).then((data)=>{
                    rows.push(data.rows)
                    done(null,rows[0]);
                });
            }
        ],(err,result)=>{
            // done(err, 'done');
            if (err) return res.status(400).send({
                success: false,
                message: [{ msg: 'Failed ' + err.stack }]
            });

            return res.status(200).send({
                success: true,
                data: result[0],
                priceRef: result[1],
                location: result[2],
                message: "Successful"
            })
        });
    },
    deleteItem:async(req,res)=>{
        const t = await sequelize.transaction();
        try {
            const deleteItem = Item.destroy({ where : {barcode: req.params.barcode}},{transaction:t});

            const deleteActual = ActualStock.destroy({ where : {barcode: req.params.barcode}},{transaction:t});
            const deletePrice = Price.destroy({ where : {barcode: req.params.barcode}},{transaction:t});
            if(deleteItem && deleteActual && deletePrice){
                try {
                    fs.unlinkSync(`uploads/item/${req.params.barcode}.jpg`);
            
                    // res.status(201).send({ message: "Image deleted" });
            
                } catch (e) {
                    console.log(e);
                    // res.status(400).send({ message: "Error deleting image!", error: e.toString(), req: req.body });
                }
                await t.commit();
                return res.status(200).send({
                    success:true,
                    message : 'Success delete Product',
                });
            }else{
                await t.rollback();
                return res.status(400).send({
                    success:false,
                    message : 'delete product failed',
                });
            }
        } catch (error) {
            await t.rollback();
                return res.status(400).send({
                    success:false,
                    message : 'delete product failed',
                });
        }
        
    }

      
}