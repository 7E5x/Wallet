import { Component, OnInit, Inject, Optional } from '@angular/core';
import { Observable } from 'rxjs';
import { BlockChain, NO_BLOCKCHAIN } from '../../model/blockchain';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BlockchainService } from '../../service/blockchain.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-select-blockchain-dialog',
  templateUrl: './select-blockchain-dialog.component.html',
  styleUrls: ['./select-blockchain-dialog.component.scss']
})
export class SelectBlockchainDialogComponent implements OnInit {
  availableBlockchains: Array<BlockChain>;
  currentBlockchain: BlockChain;

  constructor(
    private blockchainService: BlockchainService,
    private router: Router,
    public dialogRef: MatDialogRef<SelectBlockchainDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: BlockChain
  ) { }

  ngOnInit() {
    this.availableBlockchains = [];
    this.blockchainService.getAvailableBlockchains().then(blockchains => {
      this.availableBlockchains = blockchains;
    });
  }

  hideChangeBlockchainWindow() {
    this.dialogRef.close();
  }

  changeBlockchain(blockchain: BlockChain) {
    if (!this.currentBlockchain || this.currentBlockchain === NO_BLOCKCHAIN || blockchain.id !== this.currentBlockchain.id) {
      this.blockchainService.setSelectedBlockchain(blockchain).then(response => {
        this.hideChangeBlockchainWindow();
        this.router.navigate(['/']);
      });
    }
    else {
      this.hideChangeBlockchainWindow();
    }
  }
}
