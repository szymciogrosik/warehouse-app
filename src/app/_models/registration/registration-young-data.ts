import {DateTime} from "luxon";

export class RegistrationYoungData {
  id: string;
  creationTimestamp: string;
  lastModificationTimestamp: string;
  lastModificationUser: string;
  advancePayed: boolean;
  fullAmountPayed: boolean;
  additionalComments: string;
  deleted: boolean;

  question1: string;
  question2: string;
  question3: number;
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
  question15: string;
  question16: string;
  question17: string;
  question18: string;
  question19: string;
  question20: string;
  question21: string;
  question22: string;
  question23: string;
  question24: string;
  question25: string;
  question26: string;
  question27: string;
  question28: string;

  constructor(data: Partial<RegistrationYoungData>) {
    this.id = data.id ?? '';
    this.creationTimestamp = data.creationTimestamp ?? DateTime.now().toString();
    this.lastModificationTimestamp = data.lastModificationTimestamp ?? DateTime.now().toString();
    this.lastModificationUser = data.lastModificationUser ?? '';
    this.advancePayed = data.advancePayed ?? false;
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
      !data.question8 ||
      !data.question9 ||
      !data.question10 ||
      !data.question11 ||
      !data.question12 ||
      !data.question13 ||
      !data.question14 ||
      !data.question15 ||
      !data.question16 ||
      !data.question17 ||
      !data.question18 ||
      !data.question19 ||
      !data.question20 ||
      !data.question20 ||
      !data.question21 ||
      !data.question22 ||
      !data.question23 ||
      !data.question24 ||
      !data.question25 ||
      !data.question26 ||
      !data.question27 ||
      !data.question28
    ) {
      throw new Error("One of the fields is empty");
    }

    this.question1 = data.question1;
    this.question2 = data.question2.toString();
    this.question3 = data.question3;
    this.question4 = data.question4;
    this.question5 = data.question5;
    this.question6 = data.question6;
    this.question7 = data.question7;
    this.question8 = data.question8;
    this.question9 = data.question9;
    this.question10 = data.question10;
    this.question11 = data.question11;
    this.question12 = data.question12;
    this.question13 = data.question13;
    this.question14 = data.question14;
    this.question15 = data.question15;
    this.question16 = data.question16;
    this.question17 = data.question17;
    this.question18 = data.question18;
    this.question19 = data.question19;
    this.question20 = data.question20;
    this.question21 = data.question21;
    this.question22 = data.question22;
    this.question23 = data.question23;
    this.question24 = data.question24;
    this.question25 = data.question25;
    this.question26 = data.question26;
    this.question27 = data.question27;
    this.question28 = data.question28;
  }

}
