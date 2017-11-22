const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const Sequelize = require('sequelize');
const sequelize = new Sequelize('ApiSeqDemo', 'root', 'root', {
    host: 'localhost',
    dialect: 'mysql',

    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },

});

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/users/getAllUsers', function (req, res) {
    User.findAll({ raw: true }).then(usersData => {
        res.send(usersData)
    })
})

app.post('/users/addUser', function (req, res) {

    var reqBody = req.body;
    var data = { 'name': reqBody.name, 'email': reqBody.email, 'age': reqBody.age, 'status': reqBody.status }
    User.sync({force:false}).then(()=>{
        User.find({ where: { email: reqBody.email } }).then(createData=>{
            console.log(">>>>>createData",createData);
            if(createData){
                res.send('user already exists');
                
            }else{
                User.create({
                    name: reqBody.name,
                    email: reqBody.email,
                    age: reqBody.age,
                    status: reqBody.status
                
                }).then((nameEmailValue) => {
                    console.log(">>>>", nameEmailValue.fullname)
                    nameEmailValue.fullname = reqBody.name + ' ' + reqBody.email;
                });
                res.send(data);
            }
            
        })
        
    })
    
});

app.put('/users/updateUser/:id', function (req, res) {
    var reqBody = req.body;
    var updateData = { 'name': reqBody.name, 'email': reqBody.email, 'age': reqBody.age, 'status': reqBody.status }

    User.find({ where: { id: req.params.id } }).then(updatedData => {
        if (updatedData) {
            User.update({
                name: reqBody.name,
                age: reqBody.age,
                status: reqBody.status,
                email: reqBody.email
            }, {
                    where: {
                        id: req.params.id,
                    }
                });
            res.send(updateData);
        } else {
            res.send('User id does not exist')
        }

    })
})

app.delete('/users/deleteUser/:id', function (req, res) {
    var deleteUser = req.params.id;

    User.find({ where: { id: req.params.id } }).then(deleteData => {

        if(deleteData){
            User.destroy({
                where: {
                    id: req.params.id
                }
            })
            res.send('You have deleted record of user_id ' + deleteUser)
        }else{
            res.send('User id does not exist')
        }
       
    })
    

});


var server =
    app.listen(5555, () => console.log("App running"));

sequelize
    .authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

const User = sequelize.define('user', {
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        unique: true,
        validate: {
            isEmail: true
        }

    }, age: {
        type: Sequelize.INTEGER,
        defaultValue: null,
        allowNull: true

    }, status: {
        type: Sequelize.ENUM,
        values: ['active', 'pending', 'inactive']
    }
}, {
        timestamps: true,
        //paranoid: true,
        underscored: true,
        freezeTableName: false,
        getterMethods: {
            fullname() {
                return "name is " + this.name + " Email is " + this.email;
            }
        },
        setterMethods: {
            fullname(value) {
                const names = value.split(' ');
                this.setDataValue('firstname', names.slice(0, -1).join(' '));
                this.setDataValue('lastname', names.slice(-1).join(' '))
            }
        }

    });







