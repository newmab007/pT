import cheerio from 'cheerio'
import axios from 'axios'
import {WORKER_URL} from './config.js'

const urlRegex = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i;

const isUrl = (str) => { // Return true if string is a valid URL
    return urlRegex.test(str);
};

const getRandomId = () => [...Array(10)].map(i=>(~~(Math.random()*36)).toString(36)).join(''); // Return a random id 

const selectors = {
    amazon: {
        title: '#productTitle',
        price1: 'span.a-price.a-text-price.a-size-medium.apexPriceToPay > span:nth-child(2)', price2: 'span.a-price.aok-align-center.priceToPay > span.a-offscreen',
        image1: '#landingImage'
    },
    flipkart: {
        title: '.B_NuCI',
        price1: '._30jeq3._16Jk6d',
        image1: '#container > div > div._2c7YLP.UtUXW0._6t1WkM._3HqJxg > div._1YokD2._2GoDe3 > div._1YokD2._3Mn1Gg.col-5-12._78xt5Y > div:nth-child(1) > div > div._3li7GG > div._1BweB8 > div._3kidJX > div.CXW8mj._3nMexc > img',
    },
    snapdeal: {
        title: '#productOverview > div.col-xs-14.right-card-zoom.reset-padding > div > div.pdp-fash-topcenter-inner.layout > div.row > div.col-xs-18 > h1',
        price1: '#buyPriceBox > div.row.reset-margin > div.col-xs-14.reset-padding.padL8 > div.disp-table > div.pdp-e-i-PAY-r.disp-table-cell.lfloat > span.pdp-final-price > span',
        image1: '#bx-slider-left-image-panel > li:nth-child(1) > img'
    }
}

const productCommonUrl = (link) => {
  const url = new URL(link?.replace("www.", ""));
  const merchant = url.hostname.split(".")[0];
  let id, commonUrl;
  switch (merchant) {
    case "amazon":
      id = link.match(
        /https?:\/\/(www\.)?(.*)amazon\.([a-z\.]{2,6})(\/d\/(.*)|\/(.*)\/?(?:dp|o|gp|-)\/)(aw\/d\/|product\/)?(B[0-9]{1}[0-9A-Z]{8}|[0-9]{9}(?:X|[0-9]))/i
      ).splice(-1)[0];
      commonUrl = "https://www.amazon.in/dp/" + id + "?tag=asloot-21";
      break;
    case "flipkart":
      id = url.searchParams.get("pid");
      commonUrl = id ? "https://www.flipkart.com/product/p/itme?pid=" + id : link.includes('/p/itm') ?link.split('?')[0] : link;
      break;
    default:
      null;
  }

  return commonUrl;
};

const getProductDetails = async(url, merchant) => {
    try{
        const commonUrl = productCommonUrl(url);
        const res = await axios.get(`${WORKER_URL}/?url=${encodeURIComponent(commonUrl)}`, {
            headers: {
                "User-Agent":
                  "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36",
              },
        });
        const $ = cheerio.load(res.data);
        const selector = selectors[merchant];
        const price = parseInt($(selector.price1).text().trim().replace(/^\D+|[^0-9.]/g, '')) || parseInt($(selector.price2).text().trim().replace(/^\D+|[^0-9.]/g, ''));
        const title = $(selector.title).text().trim();
        const image = $(selector.image1).attr('src');
        if(!title || !price) {
            return {ok: false}
        }
        return {ok: true, title, price, image, link: commonUrl}
    }catch(e){
        console.log(e);
        return {ok: false}
    }
}

export { isUrl, getRandomId, getProductDetails, productCommonUrl };