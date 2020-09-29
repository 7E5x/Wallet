import { Component, OnInit, ViewChild, OnDestroy, ElementRef } from '@angular/core';
import { ServerConnectionService } from '../..//service/server-connection.service';
import { MatStepper } from '@angular/material/stepper';
import { WalletService } from '../..//service/wallet.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { EventTypes, ServerConnectionEvent } from '../..//model/serverConnectionEvent';
import { SyncStatusService } from '../..//service/sync-status.service';
import { TransactionsService } from '../..//service/transactions.service';
import { NotificationService } from '../..//service/notification.service';
import { TranslateService } from '@ngx-translate/core';
import {  WalletAccountAppointment, AppointmentStatus } from '../..//model/walletAccountAppointment';
import { AppointmentsService } from '../..//service/appointment.service';
import { AppointmentPuzzleDialogComponent } from '../appointment-puzzle-dialog/appointment-puzzle-dialog.component';
import { PublishAccountDialogComponent } from '../..//dialogs/publish-account-dialog/publish-account-dialog.component';


import { SyncStatus } from '../..//model/syncProcess';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DateTime } from 'luxon';
import { Accelerator } from 'electron';


enum AppointmentSteps {
  Begining = 0,
  AppointmentRequested = 1,
  AppointmentSet = 2,
  AppointmentContextCached = 3,
  AppointmentPuzzleRunning = 4,
  AppointmentPuzzleCompleted = 5,
  AppointmentCompleted = 6
}


@Component({
  selector: 'app-appointments-dialog',
  templateUrl: './appointments-dialog.component.html',
  styleUrls: ['./appointments-dialog.component.scss']
})
export class AppointmentsDialogComponent implements OnInit, OnDestroy {

  @ViewChild('stepper') stepperComponent: MatStepper;

  constructor(
    private translateService:TranslateService,
    private serverConnectionService: ServerConnectionService,
    private walletService: WalletService,
    private notificationService: NotificationService,
    private appointmentsService: AppointmentsService,
    private dialogRef: MatDialogRef<AppointmentsDialogComponent>,
    public dialog: MatDialog) {
  }

  preferredRegion:number = 1;

  wizzardStep:AppointmentSteps = AppointmentSteps.Begining;
  wizzardSubStep:number = 0;

  AppointmentSteps = AppointmentSteps;
  AppointmentStatus = AppointmentStatus;

  allowRequestAppointments:boolean = false;
  private unsubscribe$ = new Subject<void>();

  preferredRegionDetailsText:string = '';
  occidentHelpText: string = '';
  orientHelpText: string = '';

  ngOnInit() {

    this.appointmentsService.appointmentDetailsBehavior.pipe(takeUntil(this.unsubscribe$)).subscribe(accountDetails => {
      this.updateStep();
    });

    this.appointmentsService.onAppointmentStatusChanged.add(this.appointementStatusChanged);
    this.appointmentsService.onAppointmentEventOccured.add(this.appointmentEventOccured);

    this.displayPreferredRegionInfo();
  }

  appointementStatusChanged(status:AppointmentStatus){

  }

  appointmentEventOccured(event:ServerConnectionEvent){

    switch (event.eventType) {

      case EventTypes.AppointmentRequestSent:

          break;
      case EventTypes.AppointmentRequestConfirmed:

          break;
      case EventTypes.AppointmentPuzzlePreparation:

          break;
      case EventTypes.AppointmentPuzzleBegin:

        break;
      case EventTypes.AppointmentPuzzleCompleted:

        break;
      case EventTypes.AppointmentVerificationRequestCompleted:

        break;
      case EventTypes.AppointmentVerificationCompleted:

        break;
      case EventTypes.Error:

          this.allowRequestAppointments = true;

          break;
      default:
          break;
  }
  }


  ngOnDestroy(): void {

    this.appointmentsService.onAppointmentStatusChanged.remove(this.appointementStatusChanged);
    this.appointmentsService.onAppointmentEventOccured.remove(this.appointmentEventOccured);

    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  moveNext(){
    if(this.wizzardSubStep === 0){
      this.wizzardSubStep = 1;
    }
  }

  updateStep(){

    switch(this.appointmentsService.appointmentStatus){
      case AppointmentStatus.None:
        this.wizzardStep = AppointmentSteps.Begining;
        break;
      case AppointmentStatus.AppointmentRequested:
        this.wizzardStep = AppointmentSteps.AppointmentRequested;
        break;
      case AppointmentStatus.AppointmentSet:
        this.wizzardStep = AppointmentSteps.AppointmentSet;
        break;
      case AppointmentStatus.AppointmentContextCached:
        this.wizzardStep = AppointmentSteps.AppointmentContextCached;
        break;
      case AppointmentStatus.AppointmentPuzzleCompleted:
        this.wizzardStep = AppointmentSteps.AppointmentPuzzleCompleted;
        break;
      case AppointmentStatus.AppointmentCompleted:
        this.wizzardStep = AppointmentSteps.AppointmentCompleted;
        break;
    }

    if(this.wizzardStep === AppointmentSteps.Begining){
      this.allowRequestAppointments = true;
    }
  }

  get appointmentDetails():WalletAccountAppointment{
    return this.appointmentsService.appointmentDetails;
  }

  get appointmentContextSet():boolean{

    return this.appointmentDetails.Status >= AppointmentStatus.AppointmentContextCached;
  }
  get localAppointmentTime():DateTime{
    return  this.appointmentsService.localAppointmentTime;
  }

  get currentRemainingTime(): string {
    return  this.appointmentsService.currentRemainingTime;
  }

  get verificationConfirmed(): boolean {
    return  this.appointmentsService.verificationConfirmed;
  }

  get appointmentWindow(): string {
    if(this.appointmentDetails.AppointmentWindow){
      return this.appointmentDetails.AppointmentWindow.toString();
    }
    return '?';
  }

  
  makeAppointmentRequest(){

    this.allowRequestAppointments = false;
    this.walletService.RequestAppointment(this.preferredRegion).then(correlationId => {

      this.appointmentsService.correlationId = 1;
      if(this.appointmentsService.correlationId === 0){
        this.translateService.get('appointments.RequestFailed').subscribe((res: string) => {
          this.allowRequestAppointments = true;
          this.notificationService.showError(res);
        });
      }
    });
  }

  publishAccount(){
    const publishDialogRef = this.dialog.open(PublishAccountDialogComponent, {
      width: '700px',
      data: this.appointmentsService.account.value.accountCode
    });

    this.cancel();
  }

  cancel() {
    this.dialogRef.close();
  }

  displayPreferredRegionInfo(){

    
    if(this.preferredRegion === 1){
      if(this.occidentHelpText){
        this.preferredRegionDetailsText = this.occidentHelpText;
      }
      else{
        this.translateService.get('appointments.OccidentHelp').subscribe(text => {
          this.occidentHelpText = text;
          this.preferredRegionDetailsText = text;
        });
      }
    }
    else if(this.preferredRegion === 2){
      if(this.orientHelpText){
        this.preferredRegionDetailsText = this.orientHelpText;
      }
      else{
        this.translateService.get('appointments.OrientHelp').subscribe(text => {
          this.orientHelpText = text;
          this.preferredRegionDetailsText = text;
        });
      }
    }
  }
}