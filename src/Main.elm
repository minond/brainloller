module Main exposing (main)

import Editor
    exposing
        ( cmdContentBtn
        , cmdTextBtn
        , commandsForm
        , link
        , mainTitle
        , memoryTape
        , programCells
        , textCopy
        )
import Html exposing (Html, div, input, option, select, span, text)
import Html.Attributes exposing (class, id, style, type_, value)
import Html.Events exposing (on, onClick, onInput)
import Json.Decode as Json
import Lang
    exposing
        ( BLOptCode
        , BLProgram
        , BLRuntime
        , blCmdPixel
        , createRuntime
        , getBlCmd
        , getCellMaybe
        , programDimensions
        , resizeProgram
        , setCellAt
        )
import List
import Maybe
import Ports
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
import Program exposing (progFib, progHelloWorld)
import Tachyons exposing (classes)
import Tachyons.Classes as Tac
import Tuple exposing (first, second)
import Util exposing (asList)


type Msg
    = NoOp
    | SetCmd BLOptCode
    | SetSpeed String
    | LoadMemoryProgram String
    | WriteCmd Int Int Bool
    | EnableWrite
    | DisableWrite
    | IncreaseSize
    | DecreaseSize
    | DownloadProgram
    | UploadProgram
    | ImageProcessed BLProgram
    | Undo
    | Redo
    | ZoomIn
    | ZoomOut
    | Reset
    | Start
    | Pause
    | Continue
    | Tick BLRuntime
    | Halt BLRuntime


type History a
    = Curr a
    | BackCurr (List a) a
    | BackCurrForw (List a) a (List a)


type alias Model =
    { work : History BLProgram
    , activeCmd : Maybe BLOptCode
    , runtime : BLRuntime
    , boardDimensions : ( Int, Int )
    , zoomLevel : Float
    , interpreterSpeed : String
    , writeEnabled : Bool
    }


main =
    Html.program
        { init = ( initialModel, Cmd.none )
        , view = view
        , update = update
        , subscriptions = subscriptions
        }


initialModel : Model
initialModel =
    { work = Curr progHelloWorld
    , activeCmd = Nothing
    , runtime = createRuntime Nothing
    , boardDimensions = programDimensions progHelloWorld
    , zoomLevel = 1
    , interpreterSpeed = "5"
    , writeEnabled = False
    }


update : Msg -> Model -> ( Model, Cmd Msg )
update message model =
    case ( message, model, model.activeCmd ) of
        ( NoOp, _, _ ) ->
            ( model, Cmd.none )

        ( LoadMemoryProgram prog, { work }, _ ) ->
            let
                runtime =
                    createRuntime Nothing

                program =
                    case prog of
                        "helloworld.png" ->
                            progHelloWorld

                        "fib.png" ->
                            progFib

                        _ ->
                            []
            in
            ( { model
                | runtime = runtime
                , work = Curr program
              }
            , pauseExecution
                { program = program
                , runtime = runtime
                }
            )

        ( SetSpeed speed, _, _ ) ->
            ( { model | interpreterSpeed = speed }, setInterpreterSpeed speed )

        ( Pause, { work, runtime }, _ ) ->
            ( model
            , pauseExecution
                { program = historyCurr work
                , runtime = runtime
                }
            )

        ( Continue, { work, runtime }, _ ) ->
            ( model
            , startExecution
                { program = historyCurr work
                , runtime = runtime
                }
            )

        ( Start, { work, runtime }, _ ) ->
            ( model
            , startExecution
                { program = historyCurr work
                , runtime =
                    { runtime
                        | activeCoor = ( 0, 0 )
                        , activeCell = 0
                        , pointerDeg = 0
                        , input = Nothing
                        , output = Nothing
                        , memory = []
                    }
                }
            )

        ( Tick runtime, _, _ ) ->
            ( { model | runtime = runtime }, Cmd.none )

        ( Halt runtime, _, _ ) ->
            ( model, Cmd.none )

        ( UploadProgram, _, _ ) ->
            ( model, uploadProgram "#fileupload" )

        ( DownloadProgram, { work }, _ ) ->
            ( model, downloadProgram (historyCurr work) )

        ( ImageProcessed prog, _, _ ) ->
            ( { model
                | work = Curr prog
                , zoomLevel = 1
                , boardDimensions = programDimensions prog
              }
            , Cmd.none
            )

        ( Undo, { work }, _ ) ->
            case work of
                Curr _ ->
                    ( model, Cmd.none )

                BackCurr back curr ->
                    let
                        newCurr =
                            asList <| List.head back

                        newBack =
                            asList <| List.tail back

                        newForw =
                            [ curr ]

                        update =
                            BackCurrForw newBack newCurr newForw
                    in
                    ( { model | work = update }, Cmd.none )

                BackCurrForw back curr forw ->
                    let
                        newForw =
                            curr :: forw

                        update =
                            case back of
                                [] ->
                                    BackCurrForw [] curr forw

                                [ head ] ->
                                    BackCurrForw [] head newForw

                                head :: tail ->
                                    BackCurrForw tail head newForw
                    in
                    ( { model | work = update }, Cmd.none )

        ( Redo, { work }, _ ) ->
            case work of
                BackCurrForw back curr forw ->
                    let
                        newBack =
                            curr :: back

                        update =
                            case forw of
                                [] ->
                                    BackCurr back curr

                                [ head ] ->
                                    BackCurr newBack head

                                head :: tail ->
                                    BackCurrForw newBack head tail
                    in
                    ( { model | work = update }, Cmd.none )

                _ ->
                    ( model, Cmd.none )

        ( WriteCmd x y force, { writeEnabled, work }, Just activeCmd ) ->
            let
                program =
                    historyCurr work

                back =
                    program :: historyBack work

                pixel =
                    getBlCmd activeCmd blCmdPixel

                rewrite =
                    force || writeEnabled

                resized =
                    if rewrite then
                        resizeProgram program x y
                    else
                        program

                update =
                    case ( rewrite, getCellMaybe resized x y ) of
                        ( True, Just _ ) ->
                            BackCurr back (setCellAt resized x y pixel)

                        _ ->
                            work
            in
            ( { model | work = update }, Cmd.none )

        ( WriteCmd _ _ _, _, Nothing ) ->
            ( model, Cmd.none )

        ( SetCmd cmd, _, _ ) ->
            ( { model | activeCmd = Just cmd }, Cmd.none )

        ( EnableWrite, _, _ ) ->
            ( { model | writeEnabled = True }, Cmd.none )

        ( DisableWrite, _, _ ) ->
            ( { model | writeEnabled = False }, Cmd.none )

        ( IncreaseSize, { boardDimensions }, _ ) ->
            ( { model
                | boardDimensions =
                    ( first boardDimensions + 1, second boardDimensions + 1 )
              }
            , Cmd.none
            )

        ( DecreaseSize, { boardDimensions }, _ ) ->
            ( { model
                | boardDimensions =
                    ( first boardDimensions - 1, second boardDimensions - 1 )
              }
            , Cmd.none
            )

        ( ZoomIn, { zoomLevel }, _ ) ->
            ( { model | zoomLevel = zoomLevel + 0.1 }, Cmd.none )

        ( ZoomOut, { zoomLevel }, _ ) ->
            ( { model | zoomLevel = zoomLevel - 0.1 }, Cmd.none )

        ( Reset, _, _ ) ->
            ( { model | work = Curr [] }, Cmd.none )


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ imageProcessed ImageProcessed
        , interpreterTick Tick
        , interpreterHalt Halt
        ]


view : Model -> Html Msg
view model =
    let
        title =
            mainTitle "Brainloller"

        containerClasses =
            [ "main-container"
            , Tac.cf
            , Tac.pa3
            , Tac.pa4_ns
            ]
    in
    div [ classes containerClasses ]
        [ title
        , div
            [ class "cf" ]
            [ div
                [ class "editor-section fl w-100 w-50-l pr3-l" ]
                [ textCopy introText1 ]
            , div
                [ class "editor-section fl w-100 w-50-l pl3-l" ]
                [ programContainer model ]
            ]
        ]


programContainer : Model -> Html Msg
programContainer model =
    let
        uploadBtn =
            cmdContentBtn
                "Upload"
                [ onClick NoOp ]
                [ input
                    [ type_ "file"
                    , id "fileupload"
                    , class "dn"
                    , on "change" (Json.succeed UploadProgram)
                    ]
                    []
                ]

        downloadBtn =
            cmdTextBtn "Download" [ onClick DownloadProgram ]

        playBtn =
            cmdTextBtn "Play" [ onClick Start ]

        continueBtn =
            cmdTextBtn "Continue" [ onClick Continue ]

        pauseBtn =
            cmdTextBtn "Pause" [ onClick Pause ]

        undoBtn =
            cmdTextBtn "Undo" [ onClick Undo ]

        redoBtn =
            cmdTextBtn "Redo" [ onClick Redo ]

        growBtn =
            cmdTextBtn "Expand canvas" [ onClick IncreaseSize ]

        shrinkBtn =
            cmdTextBtn "Contract canvas" [ onClick DecreaseSize ]

        zoomInBtn =
            cmdTextBtn "Zoom in" [ onClick ZoomIn ]

        zoomOutBtn =
            cmdTextBtn "Zoom out" [ onClick ZoomOut ]

        resetBtn =
            cmdTextBtn "Clear" [ onClick Reset ]

        commands =
            [ playBtn
            , pauseBtn
            , continueBtn
            , undoBtn
            , redoBtn
            , growBtn
            , shrinkBtn
            , zoomInBtn
            , zoomOutBtn
            , resetBtn
            , uploadBtn
            , downloadBtn
            ]

        output =
            case model.runtime.output of
                Just content ->
                    div
                        [ class "program-output" ]
                        [ text ("Output: " ++ content) ]

                Nothing ->
                    div []
                        []
    in
    div
        [ class "noselect" ]
        [ div
            [ class "cf mb2" ]
            [ div
                [ class "fl w-100 w-50-ns pr2-ns" ]
                [ select
                    [ class "w-100"
                    , onInput LoadMemoryProgram
                    ]
                    [ option
                        []
                        [ text "helloworld.png" ]
                    , option
                        []
                        [ text "fib.png" ]
                    ]
                ]
            , div
                [ class "fl w-100 w-50-ns pl2-ns" ]
                [ input
                    [ type_ "range"
                    , class "w-100"
                    , value model.interpreterSpeed
                    , onInput SetSpeed
                    ]
                    []
                ]
            ]
        , div
            []
            (commands ++ programCommands model)
        , output
        , div
            [ class "program-memory" ]
            (memoryTape model.runtime)
        , div
            []
            [ programCanvas model ]
        ]


programCanvas : Model -> Html Msg
programCanvas model =
    let
        program =
            historyCurr model.work

        dim =
            programDimensions program

        width =
            2 + max (first dim) (first model.boardDimensions)

        height =
            2 + max (second dim) (second model.boardDimensions)

        write =
            \x y f -> WriteCmd x y f
    in
    div
        [ class "program-cells" ]
        [ div
            [ style [ ( "zoom", toString model.zoomLevel ) ] ]
            [ programCells width height program model.runtime write EnableWrite DisableWrite ]
        ]


programCommands : Model -> List (Html Msg)
programCommands model =
    let
        setCmd =
            \cmd -> SetCmd cmd

        activeCmd =
            Maybe.withDefault "" model.activeCmd
    in
    commandsForm setCmd activeCmd


historyCurr : History a -> a
historyCurr hist =
    case hist of
        Curr val ->
            val

        BackCurr _ val ->
            val

        BackCurrForw _ val _ ->
            val


historyBack : History a -> List a
historyBack hist =
    case hist of
        Curr _ ->
            []

        BackCurr back _ ->
            back

        BackCurrForw back _ _ ->
            back


introText1 : List (Html msg)
introText1 =
    [ textCopy
        [ link "Brainloller" "https://esolangs.org/wiki/Brainloller" True
        , text " is "
        , link "Brainfuck" "http://minond.xyz/brainfuck" False
        , text """ but represented as an image. In Brainfuck you start
            with a tape of cells ranging from 0 to, in this case,
            """
        , link "infinity" "https://en.wikipedia.org/wiki/Infinity" True
        , text """ or as much as your browser can store. This is your
            program's memory. Memory is manipulated using commands that let
            increment and decrement the value of the current cell and that
            let you shift the active cell to the left or to the right. In
            addition to the cell manipulating commands you have a loop
            construct (a command for starting a loop and a separate one for
            ending it) and input and output commands.
            """
        ]
    , textCopy
        [ text "This gives you a total of 8 commands that leave you with a "
        , link "turing complete" "https://en.wikipedia.org/wiki/Turing_completeness" True
        , text """ language, what ever that actually means in practice, but
            in theory it means you can program anything. Given that
            Brainloller code is store in a two dimensional image, the
            language provides two additional commands for rotating the
            instruction pointer direction.
            """
        ]
    ]
