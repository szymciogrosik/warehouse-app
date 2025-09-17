import {DateTime} from "luxon";

export class RegistrationStaffData {
  id: string;
  creationTimestamp: string;
  lastModificationTimestamp: string;
  lastModificationUser: string;
  fullAmountPayed: boolean;
  additionalComments: string;
  deleted: boolean;

  question1: string;
  question2: string;
  question3: string;
  question4: string;
  question5: string;
  question6: string;
  question7: string;
  question8: string;
  question9: string;
  question10: string;
  question11: string;
  question12: string;
  question13: string;
  question14: string;

  constructor(data: Partial<RegistrationStaffData>) {
    this.id = data.id ?? '';
    this.creationTimestamp = data.creationTimestamp ?? DateTime.now().toString();
    this.lastModificationTimestamp = data.lastModificationTimestamp ?? DateTime.now().toString();
    this.lastModificationUser = data.lastModificationUser ?? '';
    this.fullAmountPayed = data.fullAmountPayed ?? false;
    this.additionalComments = data.additionalComments ?? "";
    this.deleted = data.deleted ?? false;

    if (
      !data.question1 ||
      !data.question2 ||
      !data.question3 ||
      !data.question4 ||
      !data.question5 ||
      !data.question6 ||
      !data.question7 ||
      !data.question9 ||
      !data.question10 ||
      !data.question11 ||
      !data.question12 ||
      !data.question13 ||
      !data.question14
    ) {
      throw new Error("One of the fields is empty");
    }

    this.question1 = data.question1;
    this.question2 = data.question2;
    this.question3 = data.question3;
    this.question4 = data.question4;
    this.question5 = data.question5;
    this.question6 = data.question6.toString();
    this.question7 = data.question7;
    this.question8 = data.question8 ?? '';
    this.question9 = data.question9;
    this.question10 = data.question10;
    this.question11 = data.question11;
    this.question12 = data.question12;
    this.question13 = data.question13;
    this.question14 = data.question14;
  }
}
