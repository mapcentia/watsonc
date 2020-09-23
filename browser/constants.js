const LAYER_NAMES = [
    `v:system.all`, // 0
    `v:sensor.sensordata_without_correction`, // 1 Calypso stations
    `chemicals.boreholes_time_series_without_chemicals`, // 2 Raster layer with all boreholes
    `v:chemicals.pesticidoverblik`, // 3
    `chemicals.pesticidoverblik_raster` // 4
];

const WATER_LEVEL_KEY = `99999`;

const SELECT_CHEMICAL_DIALOG_PREFIX = `watsonc-select-chemical-dialog`;

const TEXT_FIELD_DIALOG_PREFIX = `watsonc-text-field-dialog`;

const LIMIT_CHAR = `<`;

const VIEW_MATRIX = 0;
const VIEW_ROW = 1;

const FREE_PLAN_MAX_TIME_SERIES_COUNT = 4;
const FREE_PLAN_MAX_PROFILES_COUNT = 1;

const KOMMUNER =[
    {
        "komkode": "580",
        "komnavn": "Aabenraa"
    },
    {
        "komkode": "851",
        "komnavn": "Aalborg"
    },
    {
        "komkode": "751",
        "komnavn": "Aarhus"
    },
    {
        "komkode": "492",
        "komnavn": "Ærø"
    },
    {
        "komkode": "165",
        "komnavn": "Albertslund"
    },
    {
        "komkode": "201",
        "komnavn": "Allerød"
    },
    {
        "komkode": "420",
        "komnavn": "Assens"
    },
    {
        "komkode": "151",
        "komnavn": "Ballerup"
    },
    {
        "komkode": "530",
        "komnavn": "Billund"
    },
    {
        "komkode": "400",
        "komnavn": "Bornholm"
    },
    {
        "komkode": "153",
        "komnavn": "Brøndby"
    },
    {
        "komkode": "810",
        "komnavn": "Brønderslev"
    },
    {
        "komkode": "411",
        "komnavn": "Christiansø"
    },
    {
        "komkode": "155",
        "komnavn": "Dragør"
    },
    {
        "komkode": "240",
        "komnavn": "Egedal"
    },
    {
        "komkode": "561",
        "komnavn": "Esbjerg"
    },
    {
        "komkode": "430",
        "komnavn": "Faaborg-Midtfyn"
    },
    {
        "komkode": "563",
        "komnavn": "Fanø"
    },
    {
        "komkode": "710",
        "komnavn": "Favrskov"
    },
    {
        "komkode": "320",
        "komnavn": "Faxe"
    },
    {
        "komkode": "210",
        "komnavn": "Fredensborg"
    },
    {
        "komkode": "607",
        "komnavn": "Fredericia"
    },
    {
        "komkode": "147",
        "komnavn": "Frederiksberg"
    },
    {
        "komkode": "813",
        "komnavn": "Frederikshavn"
    },
    {
        "komkode": "250",
        "komnavn": "Frederikssund"
    },
    {
        "komkode": "190",
        "komnavn": "Furesø"
    },
    {
        "komkode": "157",
        "komnavn": "Gentofte"
    },
    {
        "komkode": "159",
        "komnavn": "Gladsaxe"
    },
    {
        "komkode": "161",
        "komnavn": "Glostrup"
    },
    {
        "komkode": "253",
        "komnavn": "Greve"
    },
    {
        "komkode": "270",
        "komnavn": "Gribskov"
    },
    {
        "komkode": "376",
        "komnavn": "Guldborgsund"
    },
    {
        "komkode": "510",
        "komnavn": "Haderslev"
    },
    {
        "komkode": "260",
        "komnavn": "Halsnæs"
    },
    {
        "komkode": "766",
        "komnavn": "Hedensted"
    },
    {
        "komkode": "217",
        "komnavn": "Helsingør"
    },
    {
        "komkode": "163",
        "komnavn": "Herlev"
    },
    {
        "komkode": "657",
        "komnavn": "Herning"
    },
    {
        "komkode": "219",
        "komnavn": "Hillerød"
    },
    {
        "komkode": "860",
        "komnavn": "Hjørring"
    },
    {
        "komkode": "169",
        "komnavn": "Høje-Taastrup"
    },
    {
        "komkode": "316",
        "komnavn": "Holbæk"
    },
    {
        "komkode": "661",
        "komnavn": "Holstebro"
    },
    {
        "komkode": "615",
        "komnavn": "Horsens"
    },
    {
        "komkode": "223",
        "komnavn": "Hørsholm"
    },
    {
        "komkode": "167",
        "komnavn": "Hvidovre"
    },
    {
        "komkode": "756",
        "komnavn": "Ikast-Brande"
    },
    {
        "komkode": "183",
        "komnavn": "Ishøj"
    },
    {
        "komkode": "849",
        "komnavn": "Jammerbugt"
    },
    {
        "komkode": "326",
        "komnavn": "Kalundborg"
    },
    {
        "komkode": "440",
        "komnavn": "Kerteminde"
    },
    {
        "komkode": "101",
        "komnavn": "København"
    },
    {
        "komkode": "259",
        "komnavn": "Køge"
    },
    {
        "komkode": "621",
        "komnavn": "Kolding"
    },
    {
        "komkode": "825",
        "komnavn": "Læsø"
    },
    {
        "komkode": "482",
        "komnavn": "Langeland"
    },
    {
        "komkode": "350",
        "komnavn": "Lejre"
    },
    {
        "komkode": "665",
        "komnavn": "Lemvig"
    },
    {
        "komkode": "360",
        "komnavn": "Lolland"
    },
    {
        "komkode": "173",
        "komnavn": "Lyngby-Taarbæk"
    },
    {
        "komkode": "846",
        "komnavn": "Mariagerfjord"
    },
    {
        "komkode": "410",
        "komnavn": "Middelfart"
    },
    {
        "komkode": "773",
        "komnavn": "Morsø"
    },
    {
        "komkode": "370",
        "komnavn": "Næstved"
    },
    {
        "komkode": "707",
        "komnavn": "Norddjurs"
    },
    {
        "komkode": "480",
        "komnavn": "Nordfyns"
    },
    {
        "komkode": "450",
        "komnavn": "Nyborg"
    },
    {
        "komkode": "727",
        "komnavn": "Odder"
    },
    {
        "komkode": "461",
        "komnavn": "Odense"
    },
    {
        "komkode": "306",
        "komnavn": "Odsherred"
    },
    {
        "komkode": "730",
        "komnavn": "Randers"
    },
    {
        "komkode": "840",
        "komnavn": "Rebild"
    },
    {
        "komkode": "760",
        "komnavn": "Ringkøbing-Skjern"
    },
    {
        "komkode": "329",
        "komnavn": "Ringsted"
    },
    {
        "komkode": "175",
        "komnavn": "Rødovre"
    },
    {
        "komkode": "265",
        "komnavn": "Roskilde"
    },
    {
        "komkode": "230",
        "komnavn": "Rudersdal"
    },
    {
        "komkode": "741",
        "komnavn": "Samsø"
    },
    {
        "komkode": "740",
        "komnavn": "Silkeborg"
    },
    {
        "komkode": "746",
        "komnavn": "Skanderborg"
    },
    {
        "komkode": "779",
        "komnavn": "Skive"
    },
    {
        "komkode": "330",
        "komnavn": "Slagelse"
    },
    {
        "komkode": "269",
        "komnavn": "Solrød"
    },
    {
        "komkode": "540",
        "komnavn": "Sønderborg"
    },
    {
        "komkode": "340",
        "komnavn": "Sorø"
    },
    {
        "komkode": "336",
        "komnavn": "Stevns"
    },
    {
        "komkode": "671",
        "komnavn": "Struer"
    },
    {
        "komkode": "479",
        "komnavn": "Svendborg"
    },
    {
        "komkode": "706",
        "komnavn": "Syddjurs"
    },
    {
        "komkode": "185",
        "komnavn": "Tårnby"
    },
    {
        "komkode": "787",
        "komnavn": "Thisted"
    },
    {
        "komkode": "550",
        "komnavn": "Tønder"
    },
    {
        "komkode": "187",
        "komnavn": "Vallensbæk"
    },
    {
        "komkode": "573",
        "komnavn": "Varde"
    },
    {
        "komkode": "575",
        "komnavn": "Vejen"
    },
    {
        "komkode": "630",
        "komnavn": "Vejle"
    },
    {
        "komkode": "820",
        "komnavn": "Vesthimmerlands"
    },
    {
        "komkode": "791",
        "komnavn": "Viborg"
    },
    {
        "komkode": "390",
        "komnavn": "Vordingborg"
    }
]

export {
    LAYER_NAMES,
    WATER_LEVEL_KEY,
    SELECT_CHEMICAL_DIALOG_PREFIX,
    TEXT_FIELD_DIALOG_PREFIX,
    LIMIT_CHAR,
    VIEW_MATRIX,
    VIEW_ROW,
    FREE_PLAN_MAX_TIME_SERIES_COUNT,
    FREE_PLAN_MAX_PROFILES_COUNT,
    KOMMUNER
};
