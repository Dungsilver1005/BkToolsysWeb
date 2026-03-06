const nodes7 = require('nodes7');
const conn = new nodes7();

const plcConfig = {
    host: '192.168.0.1',
    port: 102,
    rack: 0,
    slot: 1
};
let plcData = {
    SL1: 0,
    SL2: 0,
    SL3: 0,
    SL4: 0,
    SL5: 0,
    SL6: 0,
    SL7: 0,
    SL8: 0,
    SL9: 0
};

// 9 biến tương ứng với 9 ngăn
const variables = {
    SL1: 'DB1,INT0',
    SL2: 'DB1,INT2',
    SL3: 'DB1,INT4',
    SL4: 'DB1,INT6',
    SL5: 'DB1,INT8',
    SL6: 'DB1,INT10',
    SL7: 'DB1,INT12',
    SL8: 'DB1,INT14',
    SL9: 'DB1,INT16'
};

conn.initiateConnection(plcConfig, (err) => {

    if (err) {
        console.error("❌ Lỗi kết nối PLC:", err);
        return;
    }

    console.log("✅ Đã kết nối PLC. Đang đọc dữ liệu 9 ngăn...");

    // map tên biến -> địa chỉ PLC
    conn.setTranslationCB((name) => variables[name]);

    // khai báo các biến cần đọc
    conn.addItems([
        'SL1',
        'SL2',
        'SL3',
        'SL4',
        'SL5',
        'SL6',
        'SL7',
        'SL8',
        'SL9',
    ]);

    // đọc dữ liệu mỗi 500ms
    setInterval(() => {

        conn.readAllItems((err, values) => {

            if (err) {
                console.error("❌ Lỗi đọc PLC:", err);
                return;
            }
            plcData = values;

            console.log(`[${new Date().toLocaleTimeString()}]`);
            console.log("SL1:", values.SL1);
            console.log("SL2:", values.SL2);
            console.log("SL3:", values.SL3);
            console.log("SL4:", values.SL4);
            console.log("SL5:", values.SL5);
            console.log("SL6:", values.SL6);
            console.log("SL7:", values.SL7);
            console.log("SL8:", values.SL8);
            console.log("SL9:", values.SL9);

        });

    }, 500);
});
module.exports = () => plcData;