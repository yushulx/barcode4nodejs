# Node-RED Barcode Detection Module
This Node-RED module integrates the Dynamsoft Barcode Reader SDK, enabling barcode reading capabilities within your Node-RED flows.

## Prerequisites
- Install [Node.js](https://nodejs.org/en/download/)    
- Install [Node-RED](https://nodered.org/docs/getting-started/installation)

    ```bash
    npm install -g --unsafe-perm node-red
    node-red
    ```
    
    When you run `node-red` for the first time, a folder named `.node-red` will be created in your home directory:

    - **Windows**: `%userprofile%\.node-red`
    - **Linux**: `~/.node-red`

    If the default port `1880` is occupied, modify it in `.node-red/settings.js` to use a different port, such as `18800`.

- Obtain a [Dynamsoft Barcode Reader Trial License](https://www.dynamsoft.com/customer/license/trialLicense?product=dbr)
    

## Getting Started
1. Download the project and install the Node-RED Barcode module into your `.node-red` folder:

    ```bash
    cd %userprofile%\.node-red # Windows
    cd ~/.node-red # Linux
    npm install <path-to-node-red-barcode-module>
    ```

2. Launch Node-RED:

    ```bash
    node-red
    ```

3. In the Node-RED web editor, add the following nodes:
    - Inject Node
    - File Node
    - Barcode Node
    - Debug Node
    
    Configure the `File Node` to specify the path of the file you wish to read. The file can be an image (PNG, JPG, BMP, GIF, TIFF, PDF) or a file containing a base64 string. To display results in the console, enable the system console option in the `Debug Node`.

    ![Node RED barcode](https://www.dynamsoft.com/codepool/img/2018/11/node-red-debug.PNG)

4. Click on the Barcode Node to set your license key and customize the barcode [parameter template](https://www.dynamsoft.com/barcode-reader/docs/core/parameters/structure-and-interfaces-of-parameters.html?ver=latest):

    ![Barcode license](https://www.dynamsoft.com/codepool/img/2018/11/node-red-barcode-license.PNG)
    
    **Note: If the parameter template is left empty, the default settings will be applied.**

5. Execute the Node-RED flow to see the barcode results displayed in the console:

    ![Node RED barcode results](https://www.dynamsoft.com/codepool/img/2018/11/node-red-barcode-results.PNG)

## Blog
[How to Use Node RED with Barcode Module on Windows 10](https://www.dynamsoft.com/codepool/node-red-barcode-windows.html)
