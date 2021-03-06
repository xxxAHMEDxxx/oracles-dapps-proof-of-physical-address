import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import RegisterAddressPage from './RegisterAddressPage';
import ConfirmationPage from './ConfirmationPage';
import ContractOutput from '../contract-output';

import '../assets/javascripts/init-my-web3.js';
import '../assets/javascripts/show-alert.js';

const WEB3_CHECKER_INTERV_MS = 500;

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            my_web3: null,
            web3_checker: null,
            web3_checker_dur: 0
        };
    }

    check_web3 = () => {
        console.log('check_web3');
        if (window.my_web3) {
            this.setState({ my_web3: window.my_web3 });
            clearInterval(this.state.web3_checker);
            this.setState({ web3_checker: null, web3_checker_dur: 0 });
        }
        else {
            this.setState({ web3_checker_dur: this.state.web3_checker_dur + WEB3_CHECKER_INTERV_MS });;
            console.log('no web3 yet, web3_checker_dur = ' + this.state.web3_checker_dur);
        }
    }

    componentDidMount = () => {
        console.log('App.componentDidMount');
        if (!this.state.web3_checker) {
            console.log('Starting web3_checker');
            this.setState({ web3_checker: setInterval(this.check_web3, WEB3_CHECKER_INTERV_MS) });
        }
    }

    render = () => {
        if (this.state.my_web3) {
            return (
                <BrowserRouter>
                <div>
                    <Header/>
                    <Route exact path="/" component={() => <RegisterAddressPage my_web3={this.state.my_web3} cconf={ ContractOutput.ProofOfPhysicalAddress }/> } />
                    <Route path="/confirm" component={() => <ConfirmationPage my_web3={this.state.my_web3} cconf={ ContractOutput.ProofOfPhysicalAddress }/> } />
                    <Footer/>
                </div>
                </BrowserRouter>
            );
        }
        else if (this.state.web3_checker_dur > 1000) {
            return (
                <BrowserRouter>
                <div>
                <Header/>
                    <h2>No MetaMask found!</h2>
                    This application requires MetaMask extension for Google Chrome.<br/>
                    <br/>
                    Please make sure you are running <a href="https://www.google.com/chrome/browser" target="_blank" rel="noopener noreferrer">the latest version of Google Chrome</a><br/>
                    and follow <a href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn" target="_blank" rel="noopener noreferrer">this link</a> to install MetaMask.
                <Footer/>
                </div>
                </BrowserRouter>
            );
        }
        else {
            return (
                <BrowserRouter>
                <div>
                <Header/>
                    <h2>Loading, please wait</h2>
                <Footer/>
                </div>
                </BrowserRouter>
            );
        }
    }
};

export default App;
