import React from 'react';
import { Route, BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd';
import locale from 'antd/es/locale/en_US'
//import locale from 'antd/es/locale/ru_RU';
//import 'moment/locale/ru';
import 'antd/dist/antd.css';
import Example from './examples/Example'
import ExampleAgGrid from './examples/ExampleAgGrid'
import ExampleLocalData from './examples/ExampleLocalData'

function App() {
    return <BrowserRouter>
        <ConfigProvider locale={locale}>
            <Route exact path='/' render={(props) => <Example {...props} />} />
            <Route path='/Example' render={(props) => <Example {...props} />} />
            <Route path='/ExampleAgGrid' render={(props) => <ExampleAgGrid {...props} />} />
            <Route path='/ExampleLocalData' render={(props) => <ExampleLocalData {...props} />} />
        </ConfigProvider>
    </BrowserRouter>
}
export default App;