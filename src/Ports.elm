port module Ports
    exposing
        ( downloadProgram
        , imageProcessed
        , interpreterHalt
        , interpreterTick
        , pauseExecution
        , setInterpreterSpeed
        , startExecution
        , uploadProgram
        )

import Lang exposing (BLEnvironment, BLProgram, BLRuntime)


port downloadProgram : BLProgram -> Cmd msg


port uploadProgram : String -> Cmd msg


port startExecution : BLEnvironment -> Cmd msg


port setInterpreterSpeed : String -> Cmd msg


port pauseExecution : BLEnvironment -> Cmd msg


port imageProcessed : (BLProgram -> msg) -> Sub msg


port interpreterTick : (BLRuntime -> msg) -> Sub msg


port interpreterHalt : (BLRuntime -> msg) -> Sub msg
