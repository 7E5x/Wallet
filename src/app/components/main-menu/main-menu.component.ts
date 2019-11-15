import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';

import { NO_BLOCKCHAIN, BlockChain } from '../..//model/blockchain';
import { BlockchainService } from '../..//service/blockchain.service';
import { ServerConnectionService } from '../..//service/server-connection.service';
import { MatDialog } from '@angular/material';
import { SoftwareLicenseAgreementComponent } from '../..//dialogs/terms-of-service-dialog/software-license-agreement-dialog.component';
import { DialogResult } from '../..//config/dialog-result';
import { ConfigService } from '../..//service/config.service';
import { Router } from '@angular/router';
import { CONNECTED } from '../..//model/serverConnectionEvent';

@Component({
  selector: 'main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.css']
})
export class MainMenuComponent implements OnInit, OnDestroy {
  @Output() currentBlockchainClicked: EventEmitter<any> = new EventEmitter();
  currentBlockchain: BlockChain;

  showDashboard:boolean = false;
  showSend:boolean = false;
  showHistory:boolean = false;
  showContacts:boolean = false;
  showSettings:boolean = false;
  showTools:boolean = false;
  

  constructor(
    private configService:ConfigService,
    private blockchainService: BlockchainService,
    private serverConnectionService: ServerConnectionService,
    private router:Router,
    public dialog: MatDialog) {
    }

  ngOnInit() {
    this.serverConnectionService.isConnectedToServer().subscribe(connected => {
      if (connected !== CONNECTED) {
        // nothing to do
      }
      else{
        this.blockchainService.getSelectedBlockchain().subscribe(blockchain => {
          this.currentBlockchain = blockchain;
          this.displayMenu(blockchain);
        })
      }
    })
  }

  changeBlockchain() {
    this.currentBlockchainClicked.emit(null);
  }

  ngOnDestroy() {
  }

  displayMenu(blockchain: BlockChain) {
    if (blockchain !== NO_BLOCKCHAIN) {
      this.showDashboard = blockchain.menuConfig.showDashboard;
      this.showSend = blockchain.menuConfig.showSend;
      this.showHistory = blockchain.menuConfig.showHistory;
      this.showTools = blockchain.menuConfig.showTools;
      this.showContacts = blockchain.menuConfig.showContacts;
      this.showSettings = blockchain.menuConfig.showSettings;
    }
  }

  

  

  

  showSoftwareLicenseAgreement(){
    setTimeout(() =>
      this.dialog.open(SoftwareLicenseAgreementComponent, {
        width: '250px'
      }).afterClosed().subscribe(dialogResult => {
        if (dialogResult === DialogResult.Yes) {
          this.configService.softwareLicenseAgreementShown = true;
          this.configService.saveSettings();
        }
        else {
          this.configService.softwareLicenseAgreementShown = false;
          this.configService.saveSettings();
          const remote = require('electron').remote
          let w = remote.getCurrentWindow()
          w.close();
        }
      }));
  }
}