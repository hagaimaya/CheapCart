
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const axios = require('axios');


const getFileDownloadLinksFromPage = async (pagenumber)=> {
    let data = await JSDOM.fromURL("http://prices.shufersal.co.il/FileObject/UpdateCategory?catID=2&storeId=0&page=" + pagenumber);
    let links = [...data.window.document.querySelectorAll(".webgrid-row-style")]
                    .map((item) => 
                        {
                                return item.querySelector("a").href
                        });

   
    return links;
}
const getNumberOfPages = async ()  => {
    let data = await JSDOM.fromURL("http://prices.shufersal.co.il/");
    let numberOfPages =0;
    [...data.window.document.querySelector(".webgrid-footer").querySelectorAll("a")].map(
        (item) => { 
           return item.href.toString().replace("http://prices.shufersal.co.il/?page=", "");
        }).forEach((pageNumber) => {
            if(pageNumber > numberOfPages){
                numberOfPages = pageNumber;
            }
        })
    
    return numberOfPages;
    
}

const downloadGzFile = async (gzUrl)=> {
    axios({
        method: 'get',
        url: gzUrl,
        responseType: 'stream'
      })
}
const main = async () => {
    let numberOfPages = await getNumberOfPages();
    let urls =[];
    for (let pageNumber =1; pageNumber <= numberOfPages; pageNumber++ ){
        urls.push((await getFileDownloadLinksFromPage(pageNumber))
                            .map((item) => {
                                    return item}));
    }
    
   console.log(urls);
    //gunzip('example.json.gz', 'example.json');
    
    //urls[0];   
}

main();