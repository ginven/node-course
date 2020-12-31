const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Product = sequelize.define('product', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    title: Sequelize.STRING,
    price: {
        type: Sequelize.DOUBLE,
        allowNull: false
    },
    imageUrl: {
        type: Sequelize.STRING,
        allowNull: false
    },
    description: Sequelize.STRING
});

module.exports = Product;

// module.exports = class Product {
//     constructor(id, title, imageUrl, price, desc) {
//         this.id = id;
//         this.title = title;
//         this.imageUrl = imageUrl;
//         this.price = price;
//         this.description = desc;
//     }

//     save() {
//       return db.execute('INSERT INTO products (title, price, imageUrl, description) VALUES (?, ?, ?, ?)',
//         [this.title, this.price, this.imageUrl, this.description]
//         );
//     }

//     static deleteById(id) {
//         // getProductsFromFile(products => {
//         //     const product = products.find(prod => prod.id === id);
//         //     const updatedProducts = products.filter(prod => prod.id !== id);
//         //     fs.writeFile(p, JSON.stringify(updatedProducts), (err) => {
//         //         if(!err) {
//         //             Cart.deleteProduct(id, product.price);
//         //         }
//         //         console.log(err);
//         //     });
//         // });
//     }

//     static fetchAll() {
//         return db.execute('SELECT * FROM products');
//     }

//     static findById(id) {
//         return db.execute('SELECT * FROM products WHERE products.id = ?', [id])
//     }
// }