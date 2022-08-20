
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const axios = require('axios');
const fs = require('fs');
const Path = require('path');
const zlib = require("zlib");
const Product = require('../Model/item');
const  xml2js = require('xml2js');
const ShufersalURL = "http://prices.shufersal.co.il/"
const getFileDownloadLinksFromPage = async (pagenumber) => {
    let data = await JSDOM.fromURL(ShufersalURL + "FileObject/UpdateCategory?catID=2&storeId=0&page=" + pagenumber);
    let links = [...data.window.document.querySelectorAll(".webgrid-row-style")]
        .map((item) => {
            return item.querySelector("a").href
        });


    return links;
}
const getNumberOfPages = async () => {
    let data = await JSDOM.fromURL(ShufersalURL);
    let numberOfPages = 0;
    [...data.window.document.querySelector(".webgrid-footer").querySelectorAll("a")].map(
        (item) => {
            return item.href.toString().replace(ShufersalURL + "?page=", "");
        }).forEach((pageNumber) => {
            if (pageNumber > numberOfPages) {
                numberOfPages = pageNumber;
            }
        })

    return numberOfPages;

}

const downloadGzFile = async (gzFile) => {
    const dirPath = Path.resolve(__dirname + "../../../data/shufersal/gz/", gzFile.branchId);

    const path = Path.resolve(dirPath, gzFile.name);
    //const writer = fs.createWriteStream(path);
    const response = await axios({
        url: gzFile.url,
        method: 'GET',
        responseType: 'stream'
    });

    await fs.promises.mkdir(dirPath, { recursive: true })
        .catch((error) => { console.log("mkdirerror", "error") })

    const file = fs.createWriteStream(path);
    gzFile.path = path;
    gzFile.XMLpath = Path.resolve(dirPath, gzFile.name.replace("gz","xml"));
    gzFile.JSONpath = Path.resolve(dirPath, gzFile.name.replace("gz","json"));
    const writeStream = fs.createWriteStream(gzFile.XMLpath);
    const unzip = zlib.createGunzip();
    
    await response.data.pipe(unzip).pipe(writeStream);
    fs.readFile(gzFile.XMLpath, function (err, data) {
        var parser = require('xml2json');
        let jsonItems = JSON.parse(parser.toJson(data.toString()));
        jsonItems.root.Items.Item.forEach(item => {
            let product = Product.findItemById(item.ItemCode);
            let
            if (product) {
                let store = product.shufersal.filter((branch) => {branch.storeId == jsonItems.root.StoreId})
                if(store.price != item.price){
                    store.price = item.price;
                }
            }
            else {
                product = new productsModel({
                    id:  item.ItemCode,
                    name: item.ItemName,
                    manufactureCountry: item.ManufactureCountry,
                    unitOfMeasure: item.UnitOfMeasure,
                    shufersal: [
                        {
                        storeId: jsonItems.root.StoreId,
                        price: item.ItemPrice,
                        unitofmeasureprice: item.UnitOfMeasurePrice,
                        }
                    ]
                });

            }
            
            await product.save();
            console.log(product);
            return product;
            
        });
    })
        
    return gzFile;
}

const main = async () => {
    let numberOfPages = await getNumberOfPages();
    for (let pageNumber = 1; pageNumber <= numberOfPages; pageNumber++) {
        getFileDownloadLinksFromPage(pageNumber).then(
            async (urls) => {
                urls.forEach((gzLink) => {
                    const url = new URL(gzLink);
                    const remotefileName = url.pathname.replace("/pricefull/", "");
                    const branchId = url.pathname.split("-")[1];
                    let gzFile = {
                        name: remotefileName,
                        branchId: branchId,
                        url: url.href
                    };
                    downloadGzFile(gzFile)
                        .then((gzFile) => {
                            console.log(gzFile);
                        });
                });
            });
    }
}

main();