const db = require("../models");
require("dotenv").config();
const Pembayaran = db.pembayaran;
const Purchase = db.purchase;
const Sales = db.sales;
const Customer = db.customer;
const Supplier = db.supplier;
const Alert = db.alert;
const Op= db.Sequelize.Op
const {sequelize, purchase} = require("../models");

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
    savePembayaran(req,res){
        let data = {
            date: new Date(),
            type: req.body.type,
            idSales: req.body.idSales,
            idPurchase: req.body.idPurchase,
            sumCredit: req.body.sumCredit,
            amount: req.body.amount,
            remainingCredit: req.body.remainingCredit,
            note: req.body.note
        };
        Pembayaran.create(data)
        .then(() => {
            return res.status(200).send({
                success: true,
                message : "Pembayaran save successfuly"
            });
        })
        .catch((err) => {
            res.status(500).send({
                message: "Something is wrong" + err.message,
                success: false
            });
        });
    },
    updatePembayaran(req,res){
        let data = {
            sumCredit: req.body.sumCredit,
            amount: req.body.amount,
            remainingCredit: req.body.remainingCredit,
            note: req.body.note
        };
        Pembayaran.update(data,{where : {id:req.params.id}})
        .then((dataRes) => {
            return res.status(200).send({
                success: true,
                message : "Pembayaran save successfuly"
            });
        })
        .catch((err) => {
            res.status(500).send({
                message: "Something is wrong" + err.message,
                success: false
            });
        });
    },
    getPembayaran(req,res){
        let cari = req.query['cari'] || '';
        Pembayaran.findAll(
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
    getPembayaranById(req,res){
        Pembayaran.findOne(
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
    deletePembayaran(req,res){
        Pembayaran.destroy({ where : {id: req.params.id}})
        .then( () => {
            return res.status(200).send({
                success: true,
                message: "Success Delete Pembayaran"
            });
        })
        .catch( (err) => {
            res.status(500).send({
                message: "Something is wrong" + err.message,
                success: false
            });
        });
    },

    onBayarPurchase:async(req,res)=>{
        const t = await sequelize.transaction();
        try {
            const savePembayaran = await Pembayaran.create({
                date: new Date(),
                nextDate: req.body.nextDate,
                type: req.body.type,
                idPurchase: req.body.id,
                sumCredit: req.body.sumCredit,
                amount: req.body.amount,
                remainingCredit: req.body.remainingCredit,
                note: req.body.note
            },{transaction:t});

            let status='';
            if(req.body.remainingCredit === 0){
                status = 'LUNAS';
            }else{
                status = 'CREDIT';
            }

            const updatePuchase = await Purchase.update({
                paymentMethod : status,
                credit : req.body.remainingCredit,
                limitDate : req.body.nextDate
            },{
                where:{
                    id : req.body.id
                }
            },{transaction:t});

            let updateAlert;

            if(req.body.status){

                updateAlert = await  Alert.update({
                    status :false
                },{
                    where:{
                        idPurchase : req.body.id,
                        status :true
                    }
                },{transaction:t});
            }else{
                updateAlert = true;
            }


            const getDataSupplier = await Supplier.findOne({
                where : {
                    idSupplier : req.body.idSupplier
                }
            },{transaction:t});

            console.log(await getDataSupplier);

            const updateSupplier = await Supplier.update({
                hutang : getDataSupplier.dataValues.hutang - req.body.amount
            },{
                where:{
                    idSupplier : req.body.idSupplier
                }
            },{transaction:t})

            if(savePembayaran && updatePuchase &&  updateAlert && getDataSupplier && updateSupplier){
                await t.commit();
                return res.status(200).send({
                    success:true,
                    message : 'Success payment',
                });
            }else{
                await t.rollback();
                return res.status(400).send({
                    success:false,
                    message : 'payment failed',
                });
            }
        } catch (error) {
            await t.rollback();
            console.log(error);
            return res.status(400).send({
                success:false,
                message : 'payment failed 1',
                
            });
        }
    },
    onBayarSales:async(req,res)=>{
        const t = await sequelize.transaction();
        try {
            const savePembayaran = await Pembayaran.create({
                date: new Date(),
                nextDate: req.body.nextDate,
                type: req.body.type,
                idSales: req.body.id,
                sumCredit: req.body.sumCredit,
                amount: req.body.amount,
                remainingCredit: req.body.remainingCredit,
                note: req.body.note
            },{transaction:t});

            let status='';
            if(req.body.remainingCredit <= 0){
                status = 'LUNAS';
            }else{
                status = 'CREDIT';
            }

            const updateSales = await Sales.update({
                paymentMethod : status,
                credit : (req.body.remainingCredit<0)?0:req.body.remainingCredit,
                limitDate : req.body.nextDate
            },{
                where:{
                    idSales : req.body.id
                }
            },{transaction:t});

            let updateAlert;

            if(req.body.status){

                console.log("update alert");
                updateAlert = await  Alert.update({
                    status :false
                },{
                    where:{
                        idSales : req.body.id,
                        status :true
                    }
                },{transaction:t});
            }else{
                console.log("tidak update alert");
                updateAlert = true;
            }

            

            const getDataCustomer = await Customer.findOne({
                where : {
                    idCustomer : req.body.idCustomer
                }
            },{transaction:t});


            const updateCustomer = await Customer.update({
                piutang : ((getDataCustomer.dataValues.piutang - req.body.amount)<=0)?0:getDataCustomer.dataValues.piutang - req.body.amount
            },{
                where:{
                    idCustomer : req.body.idCustomer
                }
            },{transaction:t})

            if(savePembayaran && updateSales && updateAlert && getDataCustomer && updateCustomer){
                await t.commit();
                return res.status(200).send({
                    success:true,
                    message : 'Success payment',
                });
            }else{
                await t.rollback();
                return res.status(400).send({
                    success:false,
                    message : 'payment failed',
                });
            }
        } catch (error) {
            await t.rollback();
            console.log(error);
            return res.status(400).send({
                success:false,
                message : 'payment failed 1',
                
            });
        }
    }

      
}