// bansal
import 'package:flutter_bloc/flutter_bloc.dart';
import '../models/suspect_entity.dart';

// bansal

abstract class CaseEvent {}

class LoadActiveCaseEvent extends CaseEvent {
  final String caseId;
  LoadActiveCaseEvent(this.caseId);
}

class FlagMuleAccountEvent extends CaseEvent {
  final String accountNumber;
  FlagMuleAccountEvent(this.accountNumber);
}

abstract class CaseState {}

class CaseLoadingState extends CaseState {}

class CaseLoadedState extends CaseState {
  final String caseId;
  final String caseTitle;
  final double threatScore;
  final List<SuspectEntity> suspects;
  final List<String> flaggedMules;

  CaseLoadedState({
    required this.caseId,
    required this.caseTitle,
    required this.threatScore,
    required this.suspects,
    required this.flaggedMules,
  });
}

class CaseBloc extends Bloc<CaseEvent, CaseState> {
  // bansal
  CaseBloc() : super(CaseLoadingState()) {
    on<LoadActiveCaseEvent>((event, emit) async {
      emit(CaseLoadingState());
      await Future.delayed(const Duration(milliseconds: 600));
      
      emit(CaseLoadedState(
        caseId: event.caseId,
        caseTitle: 'Operation Parcel Trap (Digital Arrest Syndicate)',
        threatScore: 97.4,
        suspects: [
          SuspectEntity(
            id: 'SUSP-01',
            fullName: 'Vikram Malhotra',
            role: 'Mule Ring Coordinator',
            riskScore: 98.2,
            lastKnownLocation: 'Mumbai Terminal 2',
          ),
          SuspectEntity(
            id: 'SUSP-02',
            fullName: 'Rajesh Shinde',
            role: 'VoIP Call Center Operative',
            riskScore: 89.0,
            lastKnownLocation: 'Pune Hub',
          ),
        ],
        flaggedMules: ['9928172635 (ICICI)', '1004827189 (Canara Bank)'],
      ));
    });

    on<FlagMuleAccountEvent>((event, emit) {
      if (state is CaseLoadedState) {
        final current = state as CaseLoadedState;
        emit(CaseLoadedState(
          caseId: current.caseId,
          caseTitle: current.caseTitle,
          threatScore: current.threatScore,
          suspects: current.suspects,
          flaggedMules: [...current.flaggedMules, event.accountNumber],
        ));
      }
    });
  }
}
