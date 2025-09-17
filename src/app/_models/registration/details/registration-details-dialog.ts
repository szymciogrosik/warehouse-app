export class RegistrationDetailsDialog {
  conferenceForWho: string;
  additionalInfo: string | null;

  constructor(
    conferenceForWho: string,
    additionalInfo: string | null,
  ) {
    this.conferenceForWho = conferenceForWho
    this.additionalInfo = additionalInfo
  }

}
