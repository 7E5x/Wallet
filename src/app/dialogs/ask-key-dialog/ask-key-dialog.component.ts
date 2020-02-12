import { Component, OnInit, Optional, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PassphraseParameters, KeyPassphraseParameters, PassphraseRequestType } from '../..//model/passphraseRequiredParameters';
import { TranslateService } from '@ngx-translate/core';

class DialogParameters{
  public parameters: PassphraseParameters;
  public type: PassphraseRequestType;
}
@Component({
  selector: 'app-ask-key-dialog',
  templateUrl: './ask-key-dialog.component.html',
  styleUrls: ['./ask-key-dialog.component.scss']
})
export class AskKeyDialogComponent implements OnInit {
  keyName:string;
  attempt:number;
  showPasswords:boolean = false;
  password:string;

  constructor(
    private translateService:TranslateService,
    public dialogRef: MatDialogRef<AskKeyDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: DialogParameters) {

      if(this.data.type === PassphraseRequestType.Key){

        let keyRequest = (<KeyPassphraseParameters>this.data.parameters);
        this.keyName = keyRequest.keyname;
      }
      else{
        let walletRequest = (<PassphraseParameters>this.data.parameters);
        this.translateService.get("wallet.Wallet").subscribe(wallet =>{
          this.keyName = wallet;
        });
      }
     }

  ngOnInit() {
  }

  ok(){
    this.dialogRef.close(this.password);
  }

  get passWordInputType():string{
    if(this.showPasswords){
      return "text";
    }
    else{
      return "password";
    }
  }

}
